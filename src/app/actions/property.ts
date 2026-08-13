"use server";

import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";
import { auth } from "@clerk/nextjs/server";

export type PropertyData = {
  // ownerId is removed from input to prevent IDOR
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
  sourceUrl?: string | null;
};

export async function createPropertyListing(data: PropertyData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // 1. Insert property using Prisma ORM (no embeddings generated here)
    const newProperty = await prisma.property.create({
      data: {
        ownerId: user.id,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        sizeSqft: data.sizeSqft,
        pricePerHour: data.pricePerHour,
        pricePerDay: data.pricePerDay,
        pricePerMonth: data.pricePerMonth,
        minDuration: data.minDuration ?? 1,
        maxDuration: data.maxDuration ?? 12,
        durationUnit: data.durationUnit ?? "MONTHS",
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        amenities: data.amenities ?? [],
        status: (data.status as any) ?? "AVAILABLE",
        sourceUrl: data.sourceUrl,
      }
    });

    // 2. Dispatch to Inngest for async durable execution of Vector Generation (Text & Vision)
    await inngest.send({
      name: "property.created",
      data: { id: newProperty.id }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create property listing:", error);
    return { success: false, error: "Internal server error" };
  }
}

