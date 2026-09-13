"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function claimLead(requestId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user || (user.role !== "BROKER" && user.role !== "OWNER")) {
      return { success: false, error: "Only brokers or owners can claim leads." };
    }

    const request = await prisma.spaceRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return { success: false, error: "Request not found." };
    }

    if (request.claimedByBrokerId) {
      return { success: false, error: "Lead already claimed." };
    }

    await prisma.spaceRequest.update({
      where: { id: requestId },
      data: {
        claimedByBrokerId: user.id,
        status: "CLAIMED"
      }
    });

    revalidatePath("/dashboard/owner/requests");
    return { success: true };
  } catch (error) {
    console.error("Error claiming lead:", error);
    return { success: false, error: "Internal server error" };
  }
}
