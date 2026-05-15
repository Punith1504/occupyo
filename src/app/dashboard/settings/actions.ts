"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function updateBusinessDetails(data: {
  companyName: string;
  phone: string;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        companyName: data.companyName,
        phone: data.phone,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating business details:", error);
    return { success: false, error: "Failed to update details" };
  }
}
