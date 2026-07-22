"use server";

import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type PropertyData = {
  ownerId: string;
  title: string;
  description: string;
  propertyType: "WAREHOUSE" | "FLEX" | "OFFICE";
  sizeSqft: number;
  pricePerHour?: number | null;
  pricePerDay?: number | null;
  pricePerMonth: number;
  minDuration?: number;
  maxDuration?: number;
  durationUnit?: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  amenities?: any;
  status?: string;
};

export async function createPropertyListing(data: PropertyData) {
  try {
    // 1. Generate text payload for embedding
    const textToEmbed = `${data.title}. ${data.description}. Located at ${data.address}. Type: ${data.propertyType}. Size: ${data.sizeSqft} sqft. Amenities: ${JSON.stringify(data.amenities || [])}.`;
    
    // 2. Fetch embeddings
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textToEmbed,
      encoding_format: "float",
    });
    
    const embedding = response.data[0].embedding;
    const embeddingString = `[${embedding.join(',')}]`;

    // 3. Insert using $executeRaw to support pgvector format
    // Parameterized to prevent SQL injection, using `::vector` cast for the embedding array string.
    await prisma.$executeRaw`
      INSERT INTO "Property" (
        "id", "ownerId", "title", "description", "propertyType", "sizeSqft",
        "pricePerHour", "pricePerDay", "pricePerMonth", "minDuration",
        "maxDuration", "durationUnit", "address", "lat", "lng", "amenities",
        "status", "createdAt", "embedding"
      ) VALUES (
        gen_random_uuid()::text,
        ${data.ownerId},
        ${data.title},
        ${data.description},
        CAST(${data.propertyType} AS "PropertyType"),
        ${data.sizeSqft},
        ${data.pricePerHour ?? null},
        ${data.pricePerDay ?? null},
        ${data.pricePerMonth},
        ${data.minDuration ?? 1},
        ${data.maxDuration ?? 12},
        ${data.durationUnit ?? "MONTHS"},
        ${data.address},
        ${data.lat ?? null},
        ${data.lng ?? null},
        CAST(${JSON.stringify(data.amenities ?? [])} AS jsonb),
        ${data.status ?? "AVAILABLE"},
        NOW(),
        ${embeddingString}::vector
      )
    `;

    return { success: true };
  } catch (error) {
    console.error("Failed to create property listing with embedding:", error);
    return { success: false, error: "Internal server error" };
  }
}
