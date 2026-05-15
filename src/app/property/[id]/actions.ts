"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createLeaseRequest(data: {
  propertyId: string;
  durationMonths: number;
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

  if (data.durationMonths < property.minLeaseMonths) {
    return { success: false, error: `Minimum lease term is ${property.minLeaseMonths} months.` };
  }

  if (data.durationMonths > property.maxLeaseMonths) {
    return { success: false, error: `Maximum lease term is ${property.maxLeaseMonths} months.` };
  }

  const startDate = new Date();
  // For MVP, just set start date as tomorrow
  startDate.setDate(startDate.getDate() + 1);
  
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + data.durationMonths);

  const totalAmount = property.pricePerMonth * data.durationMonths;

  try {
    const lease = await prisma.lease.create({
      data: {
        propertyId: property.id,
        tenantId: user.id,
        startDate: startDate,
        endDate: endDate,
        totalAmount: totalAmount,
        status: "PENDING",
      }
    });

    return { success: true, leaseId: lease.id };
  } catch (error) {
    console.error("Error creating lease:", error);
    return { success: false, error: "Failed to create lease request." };
  }
}
