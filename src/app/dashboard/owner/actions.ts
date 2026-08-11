"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PropertyType } from "@prisma/client";
import { trackEvent } from "@/lib/activity-logger";
export async function createPropertyAction(data: {
  title: string;
  description: string;
  propertyType: PropertyType;
  sizeSqft: number;
  pricePerMonth: number;
  pricePerHour?: number;
  pricePerDay?: number;
  minDuration: number;
  maxDuration: number;
  durationUnit?: string;
  address: string;
  lat: number | null;
  lng: number | null;
  amenities: string[];
  imageUrls?: string[];
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user || ((user.role as string) !== "OWNER" && (user.role as string) !== "BROKER" && (user.role as string) !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Must be an owner." };
    }

    const property = await prisma.property.create({
      data: {
        ownerId: user.id,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        sizeSqft: data.sizeSqft,
        pricePerMonth: data.pricePerMonth,
        pricePerHour: data.pricePerHour,
        pricePerDay: data.pricePerDay,
        minDuration: data.minDuration,
        maxDuration: data.maxDuration,
        durationUnit: data.durationUnit || "MONTHS",
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        amenities: data.amenities, // Json field
        images: data.imageUrls && data.imageUrls.length > 0 ? {
          create: data.imageUrls.map((url, index) => ({
            url,
            // The first image in the array is the hero (based on drag-and-drop order)
            isHero: index === 0
          }))
        } : undefined
      }
    });

    // Fire and forget logging
    trackEvent({
      userId: user.id,
      propertyId: property.id,
      type: "PROPERTY_CREATED",
      title: "New Property Listed",
      description: `Successfully published ${data.title} (${data.sizeSqft} sqft).`,
      metadata: { propertyType: data.propertyType, pricePerMonth: data.pricePerMonth }
    });

    return { success: true, propertyId: property.id };
  } catch (error) {
    console.error("Error creating property:", error);
    return { success: false, error: "Failed to create property" };
  }
}

export async function updatePropertyAction(
  propertyId: string,
  data: {
    title: string;
    description: string;
    propertyType: PropertyType;
    sizeSqft: number;
    pricePerMonth: number;
    pricePerHour?: number;
    pricePerDay?: number;
    minDuration: number;
    maxDuration: number;
    durationUnit?: string;
    address: string;
    lat: number | null;
    lng: number | null;
    amenities: string[];
    imageUrls?: string[];
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || ((user.role as string) !== "OWNER" && (user.role as string) !== "BROKER" && (user.role as string) !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Must be an owner." };
    }

    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty || existingProperty.ownerId !== user.id) {
      return { success: false, error: "Property not found or unauthorized" };
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        sizeSqft: data.sizeSqft,
        pricePerMonth: data.pricePerMonth,
        pricePerHour: data.pricePerHour,
        pricePerDay: data.pricePerDay,
        minDuration: data.minDuration,
        maxDuration: data.maxDuration,
        durationUnit: data.durationUnit || "MONTHS",
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        amenities: data.amenities, // Json field
      },
    });

    // Handle images if provided
    if (data.imageUrls) {
      // Delete existing images
      await prisma.image.deleteMany({
        where: { propertyId: propertyId },
      });

      // Create new images in the updated order
      if (data.imageUrls.length > 0) {
        await prisma.image.createMany({
          data: data.imageUrls.map((url, index) => ({
            url,
            propertyId: propertyId,
            // The first image in the array is the hero (based on drag-and-drop order)
            isHero: index === 0, 
          })),
        });
      }
    }

    return { success: true, propertyId: updatedProperty.id };
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, error: "Failed to update property" };
  }
}

export async function updatePropertyImagesAction(propertyId: string, imageUrls: string[]) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || ((user.role as string) !== "OWNER" && (user.role as string) !== "BROKER" && (user.role as string) !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Must be an owner." };
    }

    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty || existingProperty.ownerId !== user.id) {
      return { success: false, error: "Property not found or unauthorized" };
    }

    // Delete existing images
    await prisma.image.deleteMany({
      where: { propertyId: propertyId },
    });

    // Create new images in the updated order
    if (imageUrls.length > 0) {
      await prisma.image.createMany({
        data: imageUrls.map((url, index) => ({
          url,
          propertyId: propertyId,
          isHero: index === 0, 
        })),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error auto-saving images:", error);
    return { success: false, error: "Failed to auto-save images" };
  }
}
