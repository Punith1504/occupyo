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

  if (!user || ((user.role as string) !== "OWNER" && (user.role as string) !== "BROKER" && (user.role as string) !== "ADMIN")) {
    return { success: false, error: "Unauthorized. Must be an owner." };
  }

  // Verify the lease belongs to a property owned by this user
  const lease = await prisma.booking.findUnique({
    where: { id: leaseId },
    include: { property: true }
  });

  if (!lease || lease.property.ownerId !== user.id) {
    return { success: false, error: "Lease not found or unauthorized." };
  }

  try {
    await prisma.booking.update({
      where: { id: leaseId },
      data: { status }
    });

    await prisma.notification.create({
      data: {
        userId: lease.tenantId,
        type: "BOOKING_UPDATE",
        title: "Booking Request Update",
        message: `Your booking request for ${lease.property.title} was ${status.toLowerCase()}.`,
      }
    });

    revalidatePath("/dashboard/owner/leases");
    return { success: true };
  } catch (error) {
    console.error("Error updating lease:", error);
    return { success: false, error: "Failed to update lease status." };
  }
}
