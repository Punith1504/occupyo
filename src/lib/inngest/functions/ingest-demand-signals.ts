import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Mock data reflecting public Minnesota building permit filings
// In production, this would be an active fetch to Open Data Minneapolis API
const MOCK_MN_PERMITS = [
  {
    permitId: "BLD-2026-0901",
    description: "Commercial buildout for new 15,000 sqft warehouse distribution center. Applicant: Northern Logistics LLC. Expected budget: $12,000/mo equivalent. Contact: info@northernlogistics.com",
    city: "Minneapolis",
  },
  {
    permitId: "BLD-2026-0902",
    description: "Office renovation for expanding tech firm, converting 5,000 sqft to flex space. Applicant: TechFlow Inc. Contact: facilities@techflow.com",
    city: "St. Paul",
  }
];

export const ingestDemandSignals = inngest.createFunction(
  { id: "ingest-demand-signals" },
  { cron: "0 2 * * *" }, // Run daily at 2am
  async ({ step }) => {
    // 1. Fetch raw data from public API
    const rawData = await step.run("fetch-mn-permits", async () => {
      // simulated fetch to minneapolis opendata api
      return MOCK_MN_PERMITS;
    });

    // 2. Process each permit through LLM for extraction
    const extractedSignals = await step.run("extract-structured-signals", async () => {
      const results = [];
      for (const permit of rawData) {
        const rawText = `Permit: ${permit.permitId}\nCity: ${permit.city}\nDetails: ${permit.description}`;
        
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are an AI that extracts commercial real estate demand signals from public records. 
                Extract the following into a JSON object: 
                - propertyType (e.g. WAREHOUSE, OFFICE, FLEX)
                - location (city)
                - size (string, e.g. "15,000 sqft")
                - budgetOrTimeline (string, e.g. "$12,000/mo")
                - contactInfo (email or phone)`
              },
              { role: "user", content: rawText }
            ]
          });

          const extracted = JSON.parse(completion.choices[0].message.content || "{}");
          
          results.push({
            source: "MN_PUBLIC_PERMITS",
            rawText,
            propertyType: extracted.propertyType || "OTHER",
            location: extracted.location || permit.city,
            size: extracted.size || null,
            budgetOrTimeline: extracted.budgetOrTimeline || null,
            contactInfo: extracted.contactInfo || null,
            extractionConfidence: 0.95, // mock confidence
            status: "UNVERIFIED"
          });
        } catch (error) {
          console.error("Failed to extract signal:", error);
        }
      }
      return results;
    });

    // 3. Save to database
    if (extractedSignals.length > 0) {
      await step.run("save-signals", async () => {
        await prisma.externalLeadSignal.createMany({
          data: extractedSignals
        });
      });

      // 4. Trigger Outreach loop (Phase 3)
      await step.run("trigger-outreach", async () => {
        for (const signal of extractedSignals) {
          if (signal.contactInfo) {
            try {
              // Python backend is typically running on port 8000 locally or mapped in prod
              const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
              const res = await fetch(`${backendUrl}/api/v1/outreach/trigger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contact_phone: signal.contactInfo,
                  source: signal.source,
                  location: signal.location,
                  property_type: signal.propertyType
                })
              });
              const result = await res.json();
              console.log(`Outreach triggered for ${signal.contactInfo}:`, result);
            } catch (err) {
              console.error(`Failed to trigger outreach for ${signal.contactInfo}:`, err);
            }
          }
        }
      });
    }

    return { processed: extractedSignals.length };
  }
);
