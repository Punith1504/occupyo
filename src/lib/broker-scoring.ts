import { prisma } from "@/lib/prisma";

// Maximum response time before the score bottoms out (24 hours in ms)
const MAX_RESPONSE_TIME_MS = 24 * 60 * 60 * 1000;

// Scoring weights
const WEIGHTS = {
  responseTime: 0.3,
  closeRate: 0.4,
  reviews: 0.3,
} as const;

/**
 * Calculate the composite broker score from their profile stats and reviews.
 * Score is a float between 0 and 1.
 *
 * Formula:
 *   score = (responseTimeScore * 0.3) + (closeRateScore * 0.4) + (reviewScore * 0.3)
 *
 * Where:
 *   responseTimeScore = 1 - min(avgResponseTimeMs / MAX_RESPONSE_TIME, 1)
 *   closeRateScore    = totalDealsClosed / max(totalLeadsClaimed, 1)
 *   reviewScore       = avgRating / 5
 */
export function computeBrokerScore(profile: {
  avgResponseTimeMs: number;
  totalDealsClosed: number;
  totalLeadsClaimed: number;
  avgRating: number;
}): number {
  const responseTimeScore =
    1 - Math.min(profile.avgResponseTimeMs / MAX_RESPONSE_TIME_MS, 1);

  const closeRateScore =
    profile.totalDealsClosed / Math.max(profile.totalLeadsClaimed, 1);

  const reviewScore = profile.avgRating / 5;

  const composite =
    responseTimeScore * WEIGHTS.responseTime +
    closeRateScore * WEIGHTS.closeRate +
    reviewScore * WEIGHTS.reviews;

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, composite));
}

/**
 * Recompute and persist the score for a single broker profile.
 */
export async function recomputeScoreForBroker(brokerProfileId: string) {
  const profile = await prisma.brokerProfile.findUnique({
    where: { id: brokerProfileId },
    include: {
      reviews: { select: { rating: true } },
    },
  });

  if (!profile) return;

  const avgRating =
    profile.reviews.length > 0
      ? profile.reviews.reduce((sum, r) => sum + r.rating, 0) /
        profile.reviews.length
      : 0;

  const newScore = computeBrokerScore({
    avgResponseTimeMs: profile.avgResponseTimeMs,
    totalDealsClosed: profile.totalDealsClosed,
    totalLeadsClaimed: profile.totalLeadsClaimed,
    avgRating,
  });

  await prisma.brokerProfile.update({
    where: { id: brokerProfileId },
    data: { score: newScore },
  });

  return newScore;
}

/**
 * Recompute scores for ALL broker profiles. Used by the daily Inngest cron.
 */
export async function recomputeAllBrokerScores() {
  const profiles = await prisma.brokerProfile.findMany({
    include: {
      reviews: { select: { rating: true } },
    },
  });

  const updates = profiles.map((profile) => {
    const avgRating =
      profile.reviews.length > 0
        ? profile.reviews.reduce((sum, r) => sum + r.rating, 0) /
          profile.reviews.length
        : 0;

    const newScore = computeBrokerScore({
      avgResponseTimeMs: profile.avgResponseTimeMs,
      totalDealsClosed: profile.totalDealsClosed,
      totalLeadsClaimed: profile.totalLeadsClaimed,
      avgRating,
    });

    return prisma.brokerProfile.update({
      where: { id: profile.id },
      data: { score: newScore },
    });
  });

  await Promise.all(updates);
  return profiles.length;
}

/**
 * Compute a match score between a broker and a space request.
 * Based on overlap between broker's service areas / specializations
 * and the request's city / required property type.
 */
export function computeMatchScore(
  broker: { serviceAreas: string[]; specializations: string[] },
  request: { city: string; requiredType: string }
): number {
  const cityNorm = request.city.toLowerCase().trim();
  const typeNorm = request.requiredType.toUpperCase().trim();

  const cityMatch = broker.serviceAreas.some(
    (area) => area.toLowerCase().trim() === cityNorm
  )
    ? 1
    : 0;

  const typeMatch = broker.specializations.some(
    (spec) => spec.toUpperCase().trim() === typeNorm
  )
    ? 1
    : 0;

  // Weighted: city match is worth 60%, type match 40%
  return cityMatch * 0.6 + typeMatch * 0.4;
}
