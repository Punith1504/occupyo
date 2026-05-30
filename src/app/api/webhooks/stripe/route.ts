import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { trackEvent } from "@/lib/activity-logger";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.PaymentIntent;

  if (event.type === "payment_intent.succeeded") {
    const leaseId = session.metadata?.leaseId;
    
    if (!leaseId) {
      console.error("[STRIPE_WEBHOOK] No leaseId in metadata");
      return new NextResponse("Webhook error: no leaseId", { status: 400 });
    }

    try {
      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          status: "ACTIVE",
          stripePaymentId: session.id,
        },
      });
      console.log(`[STRIPE_WEBHOOK] Lease ${leaseId} set to ACTIVE`);
      
      // Fire and forget logging
      trackEvent({
        userId: session.metadata.tenantId,
        propertyId: session.metadata.propertyId, // If we added this to metadata
        type: "PAYMENT_RECEIVED",
        title: "Lease Payment Received",
        description: `Security deposit secured via Stripe for lease ${leaseId}. Escrow active.`,
        metadata: { leaseId, stripePaymentId: session.id },
      });

    } catch (error) {
      console.error("[STRIPE_WEBHOOK] Database update failed:", error);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
