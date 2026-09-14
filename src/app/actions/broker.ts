"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  recomputeScoreForBroker,
  computeMatchScore,
} from "@/lib/broker-scoring";

/**
 * Claim a SpaceRequest for the authenticated broker.
 * Records timestamp for response-time calculation and updates profile stats.
 */
export async function claimLead(spaceRequestId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { brokerProfile: true },
    });
    if (!user) return { success: false, error: "User not found" };
    if (user.role !== "BROKER")
      return { success: false, error: "Only brokers can claim leads" };

    const request = await prisma.spaceRequest.findUnique({
      where: { id: spaceRequestId },
    });
    if (!request) return { success: false, error: "Space request not found" };
    if (request.claimedByBrokerId)
      return { success: false, error: "Lead already claimed" };
    if (request.status !== "OPEN")
      return { success: false, error: "Lead is no longer open" };

    // Calculate response time (time from request creation to now)
    const responseTimeMs =
      Date.now() - new Date(request.createdAt).getTime();

    // Claim the lead
    await prisma.spaceRequest.update({
      where: { id: spaceRequestId },
      data: {
        claimedByBrokerId: user.id,
        status: "CLAIMED",
      },
    });

    // Upsert broker profile and update stats
    const profile = await prisma.brokerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        serviceAreas: [request.city],
        specializations: [request.requiredType],
        totalLeadsClaimed: 1,
        avgResponseTimeMs: responseTimeMs,
      },
      update: {
        totalLeadsClaimed: { increment: 1 },
        // Rolling average: new_avg = ((old_avg * (n-1)) + new_value) / n
        // We'll do this with a raw update for precision
      },
    });

    // Update rolling average response time
    if (profile.totalLeadsClaimed > 1) {
      const prevCount = profile.totalLeadsClaimed - 1;
      const newAvg = Math.round(
        (profile.avgResponseTimeMs * prevCount + responseTimeMs) /
          profile.totalLeadsClaimed
      );
      await prisma.brokerProfile.update({
        where: { id: profile.id },
        data: { avgResponseTimeMs: newAvg },
      });
    }

    // Recompute score after claiming
    await recomputeScoreForBroker(profile.id);

    // Create a notification for the tenant
    await prisma.notification.create({
      data: {
        userId: request.tenantId,
        type: "LEAD_CLAIMED",
        title: "A broker has claimed your request!",
        message: `${user.companyName || user.email} is ready to help you find your ${request.requiredType.toLowerCase()} space in ${request.city}.`,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to claim lead:", error);
    return { success: false, error: "Failed to claim lead" };
  }
}

/**
 * Submit a review for a broker after a deal is closed.
 */
export async function submitBrokerReview(
  dealId: string,
  rating: number,
  comment?: string
) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  if (rating < 1 || rating > 5)
    return { success: false, error: "Rating must be between 1 and 5" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) return { success: false, error: "User not found" };

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        broker: { include: { brokerProfile: true } },
        review: true,
      },
    });

    if (!deal) return { success: false, error: "Deal not found" };
    if (deal.tenantId !== user.id)
      return { success: false, error: "Only the tenant can review a deal" };
    if (deal.status !== "CLOSED")
      return { success: false, error: "Deal must be closed before reviewing" };
    if (!deal.brokerId || !deal.broker?.brokerProfile)
      return { success: false, error: "No broker associated with this deal" };
    if (deal.review)
      return { success: false, error: "This deal has already been reviewed" };

    await prisma.brokerReview.create({
      data: {
        brokerProfileId: deal.broker.brokerProfile.id,
        reviewerId: user.id,
        dealId,
        rating,
        comment: comment || null,
      },
    });

    // Recompute broker score after new review
    await recomputeScoreForBroker(deal.broker.brokerProfile.id);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

/**
 * Get ranked brokers by composite score, optionally filtered by city.
 */
export async function getBrokerLeaderboard(city?: string) {
  try {
    const profiles = await prisma.brokerProfile.findMany({
      where: city
        ? { serviceAreas: { has: city } }
        : undefined,
      include: {
        user: {
          select: {
            id: true,
            companyName: true,
            email: true,
            avatarUrl: true,
          },
        },
        reviews: {
          select: { rating: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { score: "desc" },
      take: 20,
    });

    return {
      success: true,
      brokers: profiles.map((p) => ({
        userId: p.userId,
        companyName: p.user.companyName,
        email: p.user.email,
        avatarUrl: p.user.avatarUrl,
        score: p.score,
        totalDealsClosed: p.totalDealsClosed,
        totalLeadsClaimed: p.totalLeadsClaimed,
        avgResponseTimeMs: p.avgResponseTimeMs,
        serviceAreas: p.serviceAreas,
        specializations: p.specializations,
        recentRatings: p.reviews.map((r) => r.rating),
      })),
    };
  } catch (error) {
    console.error("Failed to get broker leaderboard:", error);
    return { success: false, error: "Failed to fetch leaderboard" };
  }
}

/**
 * Get open leads for the broker dashboard with match scores.
 * Returns SpaceRequests that are OPEN and unclaimed, scored against the broker's profile.
 */
export async function getBrokerLeadFeed() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { brokerProfile: true },
    });
    if (!user) return { success: false, error: "User not found" };

    // Fetch all open, unclaimed space requests
    const openRequests = await prisma.spaceRequest.findMany({
      where: {
        status: "OPEN",
        claimedByBrokerId: null,
      },
      include: {
        tenant: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // If the broker has a profile, compute match scores; otherwise use a default
    const brokerProfile = user.brokerProfile;

    const scoredLeads = openRequests.map((req) => {
      const matchScore = brokerProfile
        ? computeMatchScore(
            {
              serviceAreas: brokerProfile.serviceAreas,
              specializations: brokerProfile.specializations,
            },
            { city: req.city, requiredType: req.requiredType }
          )
        : 0.5; // Default 50% for brokers without profiles

      // Intent score based on how detailed the request is
      let intentSignals = 0;
      if (req.description && req.description.length > 20) intentSignals++;
      if (req.maxBudget > 0) intentSignals++;
      if (req.minSqft > 0) intentSignals++;
      if (req.durationMonths >= 6) intentSignals++;
      const intentScore = Math.min(intentSignals / 4, 1);

      return {
        id: req.id,
        source: "space_request",
        rawContent: req.description || `Looking for ${req.requiredType} in ${req.city}`,
        propertyType: req.requiredType,
        targetCity: req.city,
        minSqft: req.minSqft,
        maxBudget: req.maxBudget,
        durationMonths: req.durationMonths,
        intentScore,
        matchScore,
        status: "New" as const,
        createdAt: req.createdAt.toISOString(),
        tenant: req.tenant,
      };
    });

    // Sort by match score descending
    scoredLeads.sort((a, b) => b.matchScore - a.matchScore);

    return { success: true, leads: scoredLeads };
  } catch (error) {
    console.error("Failed to get broker lead feed:", error);
    return { success: false, error: "Failed to fetch lead feed" };
  }
}
