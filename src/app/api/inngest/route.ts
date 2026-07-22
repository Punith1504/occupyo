import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generateEmbeddings } from "@/lib/inngest/functions/generate-embeddings";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateEmbeddings,
  ],
});
