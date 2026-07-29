import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

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
    
    // 1. Convert natural language to embedding, scoped to Minnesota
    const openai = getOpenAI();
    const queryWithContext = query.toLowerCase().includes('minnesota') || query.toLowerCase().includes('mn') 
      ? query 
      : `${query} in Minnesota`;

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryWithContext,
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
      console.error("Even the ultimate fallback threw an error:", fallbackError);
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: false, error: "Search temporarily unavailable. Please try again." }, { status: 503 });
      }
      
      return NextResponse.json({ 
        success: true, 
        fallbackTriggered: true, 
        properties: [{
          id: 'mock-debug-1',
          title: "Ultimate Failsafe Match",
          description: `We couldn't connect to our live servers. Click to search externally for: ${query}`,
          propertyType: "FLEX",
          address: "Minnesota Web Search",
          isExternal: true,
          sourceUrl: `https://www.loopnet.com/search/commercial-real-estate/minnesota/for-lease/?sk=${encodeURIComponent(query)}`,
          similarity: 0.99
        }] 
      });
    }
  }
}

const ExtractSchema = z.object({
  pricePerMonth: z.number().nullable().describe("Monthly rent extracted from text, or null if not found"),
  sizeSqft: z.number().nullable().describe("Square footage extracted from text, or null if not found"),
  address: z.string().describe("Address or location extracted from text, must be in MN"),
  description: z.string().describe("A clean summary of the listing")
});

async function ingestExternalPropertiesFallback(query: string) {
  try {
    const searchUrl = `https://lite.duckduckgo.com/lite/`;
    const searchBody = new URLSearchParams({
      q: query + " Minnesota commercial real estate for lease",
      kl: "us-en"
    }).toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

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
    const openai = getOpenAI();
    
    const rows = $("tr").toArray();
    for (let i = 0; i < rows.length; i++) {
      if (mockProperties.length >= 3) break;
      
      const el = rows[i];
      const titleEl = $(el).find(".result-snippet");
      if (titleEl.length > 0) {
        const prevRow = $(el).prev();
        const linkEl = prevRow.find(".result-link");
        
        const title = linkEl.text().trim();
        let url = linkEl.attr("href") || "";
        if (url.includes('uddg=')) {
          const match = url.match(/uddg=([^&]+)/);
          if (match && match[1]) {
            url = decodeURIComponent(match[1]);
          }
        }
        const snippet = titleEl.text().trim();
        
        const fullText = `${title} ${snippet}`.toLowerCase();
        const isMN = fullText.includes('minnesota') || 
                     fullText.includes(' mn') || 
                     fullText.includes(', mn') || 
                     fullText.includes('minneapolis') || 
                     fullText.includes('st. paul') ||
                     fullText.includes('st paul') ||
                     fullText.includes('rochester') ||
                     fullText.includes('duluth') ||
                     fullText.includes('bloomington');

        if (title && url && isMN) {
          let extracted = null;
          try {
            const llmResponse = await openai.chat.completions.parse({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: "You are a commercial real estate data extraction assistant. Extract structured fields from the search result snippet. If a field is not present, return null. If rent is given per square foot annually (e.g. $20/SF/yr), you MUST calculate the approximate pricePerMonth by doing (pricePerSF * sizeSqft) / 12." },
                  { role: "user", content: `Title: ${title}\nSnippet: ${snippet}` }
                ],
                response_format: zodResponseFormat(ExtractSchema, "property_extraction"),
            });
            extracted = llmResponse.choices[0].message.parsed;
          } catch (llmErr) {
            console.error("LLM Extraction failed for snippet", llmErr);
          }
          
          if (extracted) {
            const safeTitle = title.replace(/\|.*/, "").trim();
            const safeDescription = extracted.description;
            const safeAddress = extracted.address || "Minnesota";
            
            const fallbackImages = [
              "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
            ];
            const randomImg = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
            
            mockProperties.push({
              id: `external-${Math.random().toString(36).substring(7)}`,
              title: safeTitle,
              description: safeDescription,
              propertyType: title.toLowerCase().includes("warehouse") ? "WAREHOUSE" : title.toLowerCase().includes("retail") ? "RETAIL" : "OFFICE",
              address: safeAddress,
              pricePerMonth: extracted.pricePerMonth || null,
              sizeSqft: extracted.sizeSqft || null,
              isExternal: true,
              sourceUrl: url,
              images: [{ url: randomImg }],
              similarity: 0.95
            });
          }
        }
      }
    }

    if (mockProperties.length > 0) {
      return mockProperties;
    }
    
    throw new Error("No results parsed from scraper");
  } catch (err) {
    console.error("Live Web Scraping Fallback failed:", err);
    throw err; // Let the caller handle the failure and determine the fallback mechanism
  }
}
