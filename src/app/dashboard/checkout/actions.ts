"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function processMockPayment(leaseId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease) return { success: false, error: "Lease not found" };

    if (lease.tenantId !== user.id) {
      return { success: false, error: "Unauthorized to pay for this lease" };
    }

    if (lease.status !== "APPROVED") {
      return { success: false, error: "Lease is not approved yet" };
    }

    // Simulate payment processing delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update lease status and add mock payment ID
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: "ACTIVE",
        stripePaymentId: `mock_pi_${Math.random().toString(36).substr(2, 9)}`,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error processing mock payment:", error);
    return { success: false, error: "Failed to process payment." };
  }
}
