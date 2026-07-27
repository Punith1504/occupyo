"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateImageEmbedding } from "@/lib/vision/clip";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
}) : null;

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
}) : null;

export async function searchByImage(imageUrl: string, lat?: number, lng?: number, radiusMiles: number = 10) {
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
    // 1. Generate Vision Embedding using our Xenova CLIP model
    const vector = await generateImageEmbedding(imageUrl);
    const vectorString = `[${vector.join(',')}]`;

    // 2. Prepare Spatial Filter using Prisma.sql for safety
    const radiusMeters = radiusMiles * 1609.34;
    const spatialFilter = lat && lng 
      ? Prisma.sql`AND ST_DWithin("location", ST_MakePoint(${lng}, ${lat})::geography, ${radiusMeters})` 
      : Prisma.empty;

    // 3. Perform Hybrid Search: Cosine Distance (<=>) + Spatial Bounds on the imageEmbedding vector
    const properties: any[] = await prisma.$queryRaw`
      SELECT 
        "id", "ownerId", "title", "description", "propertyType", "sizeSqft",
        "pricePerHour", "pricePerDay", "pricePerMonth", "address", "lat", "lng", 
        "amenities", "status", "createdAt", "isExternal", "sourceUrl",
        1 - ("imageEmbedding" <=> ${vectorString}::vector) as similarity
      FROM "Property"
      WHERE "status" = 'AVAILABLE'
        AND "imageEmbedding" IS NOT NULL
        ${spatialFilter}
      ORDER BY "imageEmbedding" <=> ${vectorString}::vector
      LIMIT 5;
    `;

    return { success: true, properties };
  } catch (error) {
    console.error("Image search failed:", error);
    return { success: false, error: "Internal server error during vision search" };
  }
}
