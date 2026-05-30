import { prisma } from "./prisma";

export interface EventData {
  userId: string;
  propertyId?: string;
  type: "PAYMENT_RECEIVED" | "PROPERTY_CREATED" | "LEASE_APPROVED" | "SYSTEM_ALERT";
  title: string;
  description: string;
  metadata?: any;
}

// Mock Email Dispatcher
async function mockSendEmail(toUserId: string, title: string, content: string) {
  // In production, wire this up to Resend, SendGrid, etc.
  console.log(`[MOCK_EMAIL] Sending to User: ${toUserId}`);
  console.log(`[MOCK_EMAIL] Subject: ${title}`);
  console.log(`[MOCK_EMAIL] Body: ${content}`);
}

// Mock SMS Dispatcher
async function mockSendSMS(toUserId: string, content: string) {
  // In production, wire this up to Twilio
  console.log(`[MOCK_SMS] Sending to User: ${toUserId} | Message: ${content}`);
}

export async function trackEvent({
  userId,
  propertyId,
  type,
  title,
  description,
  metadata = {},
}: EventData) {
  try {
    // 1. Persist to immutable audit log
    const log = await prisma.activityLog.create({
      data: {
        userId,
        propertyId,
        type,
        title,
        description,
        metadata: JSON.stringify(metadata),
      },
    });

    // 2. Trigger asynchronous background notifications
    // Fire and forget (do not await these so we don't block the main thread)
    const handleNotifications = async () => {
      try {
        if (type === "PAYMENT_RECEIVED") {
          await mockSendEmail(userId, "Payment Successful", `Your payment for lease ${metadata.leaseId} has been securely processed and held in escrow.`);
        } else if (type === "PROPERTY_CREATED") {
          await mockSendEmail(userId, "Listing Published", `Your new property listing is live. Our Yield Analytics engine has begun calculating your Cap Rate.`);
        }
      } catch (err) {
        console.error("[NOTIFICATION_ERROR]", err);
      }
    };

    handleNotifications();

    return log;
  } catch (error) {
    console.error("[ACTIVITY_LOGGER_ERROR]", error);
    // Fail silently so we don't disrupt the critical path (e.g. Stripe Webhook shouldn't crash if logging fails)
  }
}
