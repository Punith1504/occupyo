import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generateEmbeddings } from "@/lib/inngest/functions/generate-embeddings";
import { ingestDemandSignals } from "@/lib/inngest/functions/ingest-demand-signals";
import { sendOptInSms } from "@/lib/inngest/functions/send-opt-in";
import { recomputeBrokerScores } from "@/lib/inngest/functions/recompute-broker-scores";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateEmbeddings,
    ingestDemandSignals,
    sendOptInSms,
    recomputeBrokerScores,
  ],
});
