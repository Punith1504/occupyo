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

  // Handle payment_intent.succeeded
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const leaseId = paymentIntent.metadata?.leaseId;

    if (!leaseId) {
      console.error("[STRIPE_WEBHOOK] No leaseId in metadata");
      return new NextResponse("Webhook error: no leaseId", { status: 400 });
    }

    try {
      // Idempotency guard: skip if lease is already ACTIVE
      const existingLease = await prisma.booking.findUnique({
        where: { id: leaseId },
        select: { status: true },
      });

      if (existingLease?.status === "ACTIVE") {
        console.log(`[STRIPE_WEBHOOK] Lease ${leaseId} already ACTIVE, skipping`);
        return new NextResponse(null, { status: 200 });
      }

      const lease = await prisma.booking.update({
        where: { id: leaseId },
        data: {
          status: "ACTIVE",
          stripePaymentId: paymentIntent.id,
        },
        include: { property: true },
      });

      // Upsert Payment to handle race with success page
      await prisma.payment.upsert({
        where: { bookingId: leaseId },
        update: {
          stripePaymentIntentId: paymentIntent.id,
          status: "PAID",
          amount: paymentIntent.amount_received / 100,
        },
        create: {
          bookingId: leaseId,
          stripePaymentIntentId: paymentIntent.id,
          status: "PAID",
          amount: paymentIntent.amount_received / 100,
          currency: paymentIntent.currency.toUpperCase(),
        },
      });

      // Notify Owner
      await prisma.notification.create({
        data: {
          userId: lease.property.ownerId,
          type: "PAYMENT_RECEIVED",
          title: "Payment Received",
          message: `The security deposit for ${lease.property.title} has been paid. The lease is now ACTIVE.`,
        },
      });

      // Notify Tenant
      await prisma.notification.create({
        data: {
          userId: lease.tenantId,
          type: "PAYMENT_RECEIVED",
          title: "Payment Successful",
          message: `Your payment for ${lease.property.title} was successful. The lease is now ACTIVE.`,
        },
      });

      console.log(`[STRIPE_WEBHOOK] Lease ${leaseId} set to ACTIVE`);

      // Fire and forget logging
      trackEvent({
        userId: paymentIntent.metadata.tenantId,
        propertyId: paymentIntent.metadata.propertyId || undefined,
        type: "PAYMENT_RECEIVED",
        title: "Lease Payment Received",
        description: `Security deposit secured via Stripe for lease ${leaseId}. Escrow active.`,
        metadata: { leaseId, stripePaymentId: paymentIntent.id },
      });
    } catch (error) {
      console.error("[STRIPE_WEBHOOK] Database update failed:", error);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  // Handle payment_intent.payment_failed
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const leaseId = paymentIntent.metadata?.leaseId;

    if (leaseId) {
      try {
        // Update Payment record to FAILED if it exists
        const existingPayment = await prisma.payment.findUnique({
          where: { bookingId: leaseId },
        });

        if (existingPayment) {
          await prisma.payment.update({
            where: { bookingId: leaseId },
            data: { status: "FAILED" },
          });
        } else {
          await prisma.payment.create({
            data: {
              bookingId: leaseId,
              stripePaymentIntentId: paymentIntent.id,
              status: "FAILED",
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
            },
          });
        }

        // Notify Tenant
        const lease = await prisma.booking.findUnique({
          where: { id: leaseId },
          include: { property: true },
        });

        if (lease) {
          await prisma.notification.create({
            data: {
              userId: lease.tenantId,
              type: "PAYMENT_FAILED",
              title: "Payment Failed",
              message: `Your payment for ${lease.property.title} was unsuccessful. Please try again.`,
            },
          });
        }

        console.log(`[STRIPE_WEBHOOK] Payment failed for lease ${leaseId}`);
      } catch (error) {
        console.error("[STRIPE_WEBHOOK] Failed payment handling error:", error);
      }
    }
  }

  // Handle charge.refunded
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string | null;

    if (paymentIntentId) {
      try {
        // Find the Payment by stripePaymentIntentId
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
          include: { booking: { include: { property: true } } },
        });

        if (payment) {
          const isFullRefund = charge.amount_refunded === charge.amount;

          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
            },
          });

          // If full refund, revert lease to APPROVED
          if (isFullRefund) {
            await prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: "APPROVED" },
            });
          }

          // Notify Tenant
          await prisma.notification.create({
            data: {
              userId: payment.booking.tenantId,
              type: "PAYMENT_REFUNDED",
              title: isFullRefund ? "Full Refund Processed" : "Partial Refund Processed",
              message: `A ${isFullRefund ? "full" : "partial"} refund of $${(charge.amount_refunded / 100).toLocaleString()} has been processed for ${payment.booking.property.title}.`,
            },
          });

          console.log(`[STRIPE_WEBHOOK] ${isFullRefund ? "Full" : "Partial"} refund processed for payment ${payment.id}`);
        }
      } catch (error) {
        console.error("[STRIPE_WEBHOOK] Refund handling error:", error);
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
