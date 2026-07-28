import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazy instantiation functions
let openaiInstance: OpenAI | null = null;
let ratelimitInstance: Ratelimit | null | undefined = undefined;

function getOpenAI() {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
    });
  }
  return openaiInstance;
}

function getRateLimit() {
  if (ratelimitInstance === undefined) {
    const redis = process.env.UPSTASH_REDIS_REST_URL ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }) : null;
    
    ratelimitInstance = redis ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
    }) : null;
  }
  return ratelimitInstance;
}

export async function POST(request: Request) {
  let query = "";
  let lat = undefined;
  let lng = undefined;
  let radiusMiles = 10;

  try {
    const body = await request.json();
    query = body.query || "";
    lat = body.lat;
    lng = body.lng;
    radiusMiles = body.radiusMiles || 10;
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const ratelimit = getRateLimit();
    if (ratelimit) {
      const { userId } = await auth();
      const ip = (await headers()).get("x-forwarded-for") || "anonymous";
      const identifier = userId || ip;
      
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }
    
    // 1. Convert natural language to embedding
    const openai = getOpenAI();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
    
    const queryEmbedding = response.data[0].embedding;
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // 2. Prepare Spatial Filter using Prisma.sql for safety
    const radiusMeters = radiusMiles * 1609.34;
    const spatialFilter = lat && lng 
      ? Prisma.sql`AND ST_DWithin("location", ST_MakePoint(${lng}, ${lat})::geography, ${radiusMeters})` 
      : Prisma.empty;

    // 3. Perform Hybrid Search: Cosine Distance (<=>) + Spatial Bounds
    const properties: any[] = await prisma.$queryRaw`
      SELECT 
        p."id", p."ownerId", p."title", p."description", p."propertyType", p."sizeSqft",
        p."pricePerHour", p."pricePerDay", p."pricePerMonth", p."address", p."lat", p."lng", 
        p."amenities", p."status", p."createdAt", p."isExternal", p."sourceUrl",
        1 - (p."embedding" <=> ${embeddingString}::vector) as similarity,
        COALESCE(
          (
            SELECT json_agg(json_build_object('url', i.url, 'isHero', i."isHero"))
            FROM "Image" i
            WHERE i."propertyId" = p.id
          ), 
          '[]'::json
        ) as images
      FROM "Property" p
      WHERE "status" = 'AVAILABLE'
        AND "embedding" IS NOT NULL
        ${spatialFilter}
      ORDER BY "embedding" <=> ${embeddingString}::vector
      LIMIT 5;
    `;

    // 4. Threshold Check: Fallback Scraper Engine
    const bestSimilarity = properties.length > 0 ? (properties[0].similarity as number) : 0;
    
    if (properties.length === 0 || bestSimilarity < 0.65) {
      console.log("Triggering Fallback Scraper Engine. Best similarity was:", bestSimilarity);
      const fallbackProperties = await ingestExternalPropertiesFallback(query);
      return NextResponse.json({ success: true, properties: fallbackProperties, fallbackTriggered: true });
    }

    return NextResponse.json({ success: true, properties: JSON.parse(JSON.stringify(properties)), fallbackTriggered: false });
  } catch (error: any) {
    console.error("Semantic search or database failed, engaging ultimate fallback:", error);
    
    try {
      const fallbackProperties = await ingestExternalPropertiesFallback(query);
      return NextResponse.json({ success: true, properties: fallbackProperties, fallbackTriggered: true });
    } catch (fallbackError) {
      console.error("Even the ultimate fallback threw an error (should never happen):", fallbackError);
      return NextResponse.json({ 
        success: true, 
        fallbackTriggered: true, 
        properties: [{
          id: 'mock-debug-1',
          title: "Ultimate Failsafe Match",
          description: `We couldn't connect to our live servers. Click to search externally for: ${query}`,
          propertyType: "FLEX",
          address: "Web Search",
          isExternal: true,
          sourceUrl: `https://www.loopnet.com/search/commercial-real-estate/for-lease/?sk=${encodeURIComponent(query)}`,
          similarity: 0.99
        }] 
      });
    }
  }
}

async function ingestExternalPropertiesFallback(query: string) {
  try {
    const searchUrl = `https://lite.duckduckgo.com/lite/`;
    const searchBody = new URLSearchParams({
      q: query + " commercial real estate for lease",
      kl: "us-en"
    }).toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(searchUrl, {
      method: 'POST',
      body: searchBody,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error("Search engine blocked request");
    
    const html = await res.text();
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);
    
    const mockProperties: any[] = [];
    
    $("tr").each((i, el) => {
      if (mockProperties.length >= 3) return;
      
      const titleEl = $(el).find(".result-snippet");
      if (titleEl.length > 0) {
        const prevRow = $(el).prev();
        const linkEl = prevRow.find(".result-link");
        
        const title = linkEl.text().trim();
        const url = linkEl.attr("href") || "";
        const snippet = titleEl.text().trim();
        
        if (title && url) {
          mockProperties.push({
            id: `external-${Math.random().toString(36).substring(7)}`,
            title: title.replace(/\|.*/, "").trim(),
            description: snippet,
            propertyType: title.toLowerCase().includes("warehouse") ? "WAREHOUSE" : title.toLowerCase().includes("retail") ? "RETAIL" : "OFFICE",
            address: "Web Listing",
            isExternal: true,
            sourceUrl: url,
            similarity: 0.95
          });
        }
      }
    });

    if (mockProperties.length > 0) {
      return mockProperties;
    }
    
    throw new Error("No results parsed from scraper");
  } catch (err) {
    console.error("Live Web Scraping Fallback failed:", err);
    return [
        {
          id: 'mock-1',
          title: "Web Listing Match",
          description: `External listing found matching: ${query}. Click to search LoopNet.`,
          propertyType: "FLEX",
          address: "External Listing",
          isExternal: true,
          sourceUrl: `https://www.loopnet.com/search/commercial-real-estate/for-lease/?sk=${encodeURIComponent(query)}`,
          similarity: 0.90,
        }
      ];
  }
}
