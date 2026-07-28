"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as cheerio from "cheerio";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

const redis = process.env.UPSTASH_REDIS_REST_URL ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
}) : null;

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
}) : null;

if (process.env.NODE_ENV === 'production' && !ratelimit) {
  console.warn("[WARN] UPSTASH_REDIS_REST_URL is missing. Rate limiting is disabled in PRODUCTION.");
}

export async function searchSimilarProperties(query: string, lat?: number, lng?: number, radiusMiles: number = 10) {
  try {
    if (ratelimit) {
      const { userId } = await auth();
      const ip = (await headers()).get("x-forwarded-for") || "anonymous";
      const identifier = userId || ip;
      
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        return { success: false, error: "Too many requests. Please try again later." };
      }
    }
    // 1. Convert natural language to embedding
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
      return { success: true, properties: fallbackProperties, fallbackTriggered: true };
    }

    return { success: true, properties, fallbackTriggered: false };
  } catch (error: any) {
              similarity: 0.99,
            },
            {
              id: 'mock-2',
              title: "Industrial Flex Space for Shoots",
              description: "High ceilings and industrial vibe. Great for sets and large productions.",
              propertyType: "WAREHOUSE",
              sizeSqft: 3200,
              pricePerMonth: 2950,
              address: "Seattle, WA",
              isExternal: true,
              similarity: 0.96,
            }
          ] 
        };
      } else {
        return { success: false, error: "Search is temporarily unavailable" };
      }
    }
    console.error("Semantic search failed:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function autocompleteSearch(query: string) {
  try {
    if (!query || query.length < 2) return { success: true, properties: [], keywords: [] };
    
    // Quick full text search for instant autocomplete
    const properties = await prisma.property.findMany({
      where: {
        status: "AVAILABLE",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ]
      },
      select: { id: true, title: true, address: true, propertyType: true, pricePerMonth: true },
      take: 4,
    });

    const keywords = [];
    const lowerQuery = query.toLowerCase();
    if ("warehouse".includes(lowerQuery) || "industrial".includes(lowerQuery)) keywords.push("Warehouse Space");
    if ("office".includes(lowerQuery) || "suite".includes(lowerQuery)) keywords.push("Office Suite");
    if ("retail".includes(lowerQuery) || "store".includes(lowerQuery)) keywords.push("Retail Storefront");
    if ("studio".includes(lowerQuery) || "creative".includes(lowerQuery)) keywords.push("Creative Studio");

    return { success: true, properties, keywords };
  } catch (error) {
    console.error("Autocomplete failed:", error);
    return { success: false, properties: [], keywords: [] };
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
    const $ = cheerio.load(html);
    
    const mockProperties: any[] = [];
    
    $("tr").each((i, el) => {
      if (mockProperties.length >= 3) return;
      
      const titleEl = $(el).find(".result-snippet");
      if (titleEl.length > 0) {
        // Find the previous row for the title and link
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
    // Ultimate failsafe mock - always return this so UI never crashes
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

