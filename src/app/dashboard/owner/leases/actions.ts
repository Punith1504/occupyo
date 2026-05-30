"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateLeaseStatus(leaseId: string, status: "APPROVED" | "REJECTED") {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user || (user.role as string) !== "OWNER" && (user.role as string) !== "ADMIN" && (user.role as string) !== "ADMIN") {
    return { success: false, error: "Unauthorized. Must be an owner." };
  }

  // Verify the lease belongs to a property owned by this user
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { property: true }
  });

  if (!lease || lease.property.ownerId !== user.id) {
    return { success: false, error: "Lease not found or unauthorized." };
  }

  try {
    await prisma.lease.update({
      where: { id: leaseId },
      data: { status }
    });

    revalidatePath("/dashboard/owner/leases");
    return { success: true };
  } catch (error) {
    console.error("Error updating lease:", error);
    return { success: false, error: "Failed to update lease status." };
  }
}
