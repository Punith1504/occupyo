"use server";

import { prisma } from "@/lib/prisma";
import { DealStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function createDeal(propertyId: string, tenantId: string, brokerId?: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const caller = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!caller) throw new Error("User not found");

    let finalTenantId = caller.id;
    let finalBrokerId = null;

    if (brokerId) {
      if (caller.role !== "BROKER") {
        throw new Error("Only brokers can create deals on behalf of tenants");
      }
      finalBrokerId = caller.id;
      finalTenantId = tenantId;
    }
    
    const deal = await prisma.deal.create({
      data: {
        propertyId,
        tenantId: finalTenantId,
        brokerId: finalBrokerId,
        status: DealStatus.INQUIRY,
      }
    });
    revalidatePath(`/dashboard/deals`);
    return { success: true, dealId: deal.id };
  } catch (error) {
    console.error("Failed to create deal:", error);
    return { success: false, error: "Failed to create deal" };
  }
}

export async function generateDigitalLOI(dealId: string, proposedRent: number, leaseTermMonths: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { tenant: true, property: { include: { owner: true } }, broker: true }
    });
    
    if (!deal) throw new Error("Deal not found");
    
    if (deal.tenant.clerkUserId !== userId && deal.property.owner.clerkUserId !== userId && deal.broker?.clerkUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const loiDocumentUrl = `/dashboard/deals/${dealId}/loi`;
    
    await prisma.deal.update({
      where: { id: dealId },
      data: {
        proposedRent,
        leaseTermMonths,
        status: DealStatus.LOI_SUBMITTED,
        loiDocumentUrl,
      }
    });
    revalidatePath(`/dashboard/deals`);
    return { success: true, loiDocumentUrl };
  } catch (error) {
    console.error("Failed to generate digital LOI:", error);
    return { success: false, error: "Failed to generate digital LOI" };
  }
}

const VALID_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  [DealStatus.INQUIRY]: [DealStatus.TOUR, DealStatus.LOI_SUBMITTED],
  [DealStatus.TOUR]: [DealStatus.LOI_SUBMITTED, DealStatus.CLOSED],
  [DealStatus.LOI_SUBMITTED]: [DealStatus.LEASE_SIGNED, DealStatus.CLOSED],
  [DealStatus.LEASE_SIGNED]: [DealStatus.CLOSED],
  [DealStatus.CLOSED]: [],
};

export async function updateDealStatus(dealId: string, status: DealStatus) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { tenant: true, property: { include: { owner: true } }, broker: true }
    });

    if (!deal) throw new Error("Deal not found");
    
    if (deal.tenant.clerkUserId !== userId && deal.property.owner.clerkUserId !== userId && deal.broker?.clerkUserId !== userId) {
      throw new Error("Unauthorized");
    }

    if (!VALID_TRANSITIONS[deal.status].includes(status)) {
      throw new Error(`Invalid transition from ${deal.status} to ${status}`);
    }

    let updateData: any = { status };
    
    // Auto-calculate 1% commission fee upon closing
    if (status === DealStatus.CLOSED) {
      if (deal.proposedRent && deal.leaseTermMonths) {
        updateData.commissionFee = deal.proposedRent * deal.leaseTermMonths * 0.01;
      }
    }
    
    await prisma.deal.update({
      where: { id: dealId },
      data: updateData
    });
    
    revalidatePath(`/dashboard/deals`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update deal status:", error);
    return { success: false, error: "Failed to update deal status" };
  }
}
