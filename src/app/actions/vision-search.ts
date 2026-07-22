"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateImageEmbedding } from "@/lib/vision/clip";

export async function searchByImage(imageUrl: string, lat?: number, lng?: number, radiusMiles: number = 10) {
  try {
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
