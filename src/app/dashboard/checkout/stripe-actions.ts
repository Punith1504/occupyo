"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function createStripeCheckoutSession(leaseId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const lease = await prisma.lease.findUnique({ 
      where: { id: leaseId },
      include: { property: true }
    });
    
    if (!lease) return { success: false, error: "Lease not found" };
    if (lease.tenantId !== user.id) return { success: false, error: "Unauthorized" };
    if (lease.status !== "APPROVED") return { success: false, error: "Lease is not approved yet" };

    const headersList = await headers();
    // Use x-forwarded-proto and x-forwarded-host if available, otherwise fallback to the new domain
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "occupyo.com";
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // 2% platform fee
    const amount = lease.property.pricePerMonth;
    const totalAmount = Math.round(amount * 1.02 * 100); // Stripe expects cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Security Deposit: ${lease.property.title}`,
              description: "First month's rent + 2% platform fee",
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}&lease_id=${leaseId}`,
      cancel_url: `${origin}/dashboard/checkout/${leaseId}`,
      metadata: {
        leaseId: lease.id,
        tenantId: user.id,
      },
    });

    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false, error: "Failed to initialize payment." };
  }
}
