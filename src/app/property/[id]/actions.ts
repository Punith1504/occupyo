"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createLeaseRequest(data: {
  propertyId: string;
  duration: number;
  durationUnit: string;
  bookingType: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user || user.role !== "TENANT" && user.role !== "ADMIN") {
    return { success: false, error: "Only registered tenants can request bookings." };
  }

  const property = await prisma.property.findUnique({
    where: { id: data.propertyId }
  });

  if (!property) {
    return { success: false, error: "Property not found." };
  }

  if (data.duration < property.minDuration) {
    return { success: false, error: `Minimum term is ${property.minDuration} ${property.durationUnit.toLowerCase()}.` };
  }

  if (data.duration > property.maxDuration) {
    return { success: false, error: `Maximum term is ${property.maxDuration} ${property.durationUnit.toLowerCase()}.` };
  }

  const startDate = new Date();
  // For MVP, just set start date as tomorrow
  startDate.setDate(startDate.getDate() + 1);
  
  const endDate = new Date(startDate);
  if (data.bookingType === "HOURLY") {
    endDate.setHours(endDate.getHours() + data.duration);
  } else if (data.bookingType === "DAILY") {
    endDate.setDate(endDate.getDate() + data.duration);
  } else {
    endDate.setMonth(endDate.getMonth() + data.duration);
  }

  let totalAmount = property.pricePerMonth * data.duration;
  if (data.bookingType === "HOURLY" && property.pricePerHour) {
    totalAmount = property.pricePerHour * data.duration;
  } else if (data.bookingType === "DAILY" && property.pricePerDay) {
    totalAmount = property.pricePerDay * data.duration;
  }

  try {
    const lease = await prisma.lease.create({
      data: {
        propertyId: property.id,
        tenantId: user.id,
        startDate: startDate,
        endDate: endDate,
        totalAmount: totalAmount,
        bookingType: data.bookingType,
        status: "PENDING",
      }
    });

    return { success: true, leaseId: lease.id };
  } catch (error) {
    console.error("Error creating lease:", error);
    return { success: false, error: "Failed to create lease request." };
  }
}
