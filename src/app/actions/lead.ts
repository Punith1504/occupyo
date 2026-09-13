"use server";

import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function ingestAnonymousLead(content: string) {
  if (!content || content.trim() === '') {
    return { status: "error", message: "Content cannot be empty" };
  }

  try {
    const rawText = content.trim();
    // Compute SHA-256 hash for deduplication
    const contentHash = crypto.createHash('sha256').update(`homepage_modal:${rawText}`).digest('hex');

    await prisma.externalLeadSignal.upsert({
      where: { contentHash },
      update: {},
      create: {
        source: "homepage_modal",
        rawText,
        propertyType: "OTHER", // AI extraction can run asynchronously or fallback
        location: "Unknown",
        status: "UNVERIFIED",
        contentHash,
      },
    });

    return { status: "accepted", message: "Requirements submitted successfully" };
  } catch (error: any) {
    console.error("Failed to ingest anonymous lead:", error);
    return { status: "error", message: "Failed to submit requirements" };
  }
}
