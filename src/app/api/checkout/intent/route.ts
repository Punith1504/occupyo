import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { leaseId, idempotencyKey } = body;

    if (!leaseId || !idempotencyKey) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lease = await prisma.booking.findUnique({
      where: { id: leaseId },
      include: { tenant: true },
    });

    if (!lease) {
      return new NextResponse("Lease not found", { status: 404 });
    }

    if (lease.tenant.clerkUserId !== userId) {
      return new NextResponse("Unauthorized to access this lease", { status: 403 });
    }

    if (lease.status !== "APPROVED") {
      return new NextResponse("Lease is not approved yet", { status: 400 });
    }

    // Convert totalAmount to cents for Stripe
    const amountInCents = Math.round(lease.totalAmount * 100);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        leaseId: lease.id,
        tenantId: lease.tenant.id,
      },
      // In a real application, you might also want to set automatic_payment_methods
      automatic_payment_methods: {
        enabled: true,
      },
    }, {
      idempotencyKey,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("[CHECKOUT_INTENT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
