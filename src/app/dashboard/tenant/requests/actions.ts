"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { PropertyType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createSpaceRequest(data: {
  requiredType: PropertyType;
  minSqft: number;
  maxBudget: number;
  durationMonths: number;
  city: string;
  description?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user || (user.role as string) !== "TENANT" && (user.role as string) !== "ADMIN" && (user.role as string) !== "ADMIN") {
    return { success: false, error: "Only registered tenants can post space requests." };
  }

  try {
    await prisma.spaceRequest.create({
      data: {
        tenantId: user.id,
        requiredType: data.requiredType,
        minSqft: data.minSqft,
        maxBudget: data.maxBudget,
        durationMonths: data.durationMonths,
        city: data.city,
        description: data.description,
        status: "OPEN",
      }
    });

    revalidatePath("/dashboard/tenant/requests");
    return { success: true };
  } catch (error) {
    console.error("Error creating space request:", error);
    return { success: false, error: "Failed to post space request." };
  }
}
