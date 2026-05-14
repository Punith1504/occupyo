"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PropertyType } from "@prisma/client";

export async function createPropertyAction(data: {
  title: string;
  description: string;
  propertyType: PropertyType;
  sizeSqft: number;
  pricePerMonth: number;
  minLeaseMonths: number;
  maxLeaseMonths: number;
  address: string;
  lat: number | null;
  lng: number | null;
  amenities: string[];
  imageUrls?: string[];
}) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user || user.role !== "OWNER") {
    return { success: false, error: "Unauthorized. Must be an owner." };
  }

  try {
    const property = await prisma.property.create({
      data: {
        ownerId: user.id,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        sizeSqft: data.sizeSqft,
        pricePerMonth: data.pricePerMonth,
        minLeaseMonths: data.minLeaseMonths,
        maxLeaseMonths: data.maxLeaseMonths,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        amenities: data.amenities, // Json field
        images: data.imageUrls && data.imageUrls.length > 0 ? {
          create: data.imageUrls.map((url, index) => ({
            url,
            isHero: index === 0 // First image is hero
          }))
        } : undefined
      }
    });

    return { success: true, propertyId: property.id };
  } catch (error) {
    console.error("Error creating property:", error);
    return { success: false, error: "Failed to create property" };
  }
}
