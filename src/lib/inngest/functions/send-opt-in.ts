import { inngest } from "@/lib/inngest/client";

export const sendOptInSms = inngest.createFunction(
  { id: "send-opt-in-sms", triggers: [{ event: "lead.opt.in.send" }] },
  async ({ event, step }) => {
    const { contactInfo, source, location, propertyType } = event.data;

    await step.run("send-sms", async () => {
      // Python backend is typically running on port 8000 locally or mapped in prod
      const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";
      
      const res = await fetch(`${backendUrl}/api/v1/outreach/opt-in-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_phone: contactInfo,
          source: source,
          location: location,
          property_type: propertyType
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send Opt-in SMS: ${res.status} - ${errorText}`);
      }
      
      const result = await res.json();
      return result;
    });

    return { success: true, contact: contactInfo };
  }
);
