import { inngest } from "@/lib/inngest/client";
import { recomputeAllBrokerScores } from "@/lib/broker-scoring";

/**
 * Daily cron job that recomputes all broker scores based on
 * their cumulative performance metrics and review ratings.
 *
 * Runs at 3:00 AM UTC every day.
 */
export const recomputeBrokerScores = inngest.createFunction(
  {
    id: "recompute-broker-scores",
    triggers: [{ cron: "0 3 * * *" }],
  },
  async ({ step }) => {
    const count = await step.run("recompute-all-scores", async () => {
      return recomputeAllBrokerScores();
    });

    return { recomputed: count };
  }
);
