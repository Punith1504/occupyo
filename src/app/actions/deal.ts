"use server";

import { prisma } from "@/lib/prisma";
import { DealStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createDeal(propertyId: string, tenantId: string, brokerId?: string) {
  try {
    const deal = await prisma.deal.create({
      data: {
        propertyId,
        tenantId,
        brokerId,
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
    const loiDocumentUrl = `/dashboard/deals/${dealId}/loi`;
    
    const deal = await prisma.deal.update({
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

export async function updateDealStatus(dealId: string, status: DealStatus) {
  try {
    let updateData: any = { status };
    
    // Auto-calculate 1% commission fee upon closing
    if (status === DealStatus.CLOSED) {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (deal?.proposedRent && deal?.leaseTermMonths) {
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
