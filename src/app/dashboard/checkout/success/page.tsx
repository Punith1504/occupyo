import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2023-10-16" as any,
});

export default async function CheckoutSuccessPage(
  props: {
    searchParams: Promise<{ session_id?: string; lease_id?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const sessionId = searchParams.session_id;
  const leaseId = searchParams.lease_id;

  if (!sessionId || !leaseId) {
    redirect("/dashboard");
  }

  // Verify with Stripe that the payment was successful
  let paymentSucceeded = false;
  let stripePaymentId = "";

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid") {
      paymentSucceeded = true;
      stripePaymentId = session.payment_intent as string || sessionId;

      // Update the lease status to ACTIVE
      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          status: "ACTIVE",
          stripePaymentId: stripePaymentId,
        },
      });
    }
  } catch (error) {
    console.error("Error verifying Stripe session:", error);
  }

  if (!paymentSucceeded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Unverified</h1>
          <p className="text-gray-600 mb-8">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
            We couldn't verify your payment with Stripe. If you were charged, please contact support.
          </p>
          <Link 
            href="/dashboard/tenant/leases"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Leases <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-12 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-3">
          Your security deposit has been processed and your lease is now <strong>Active</strong>.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Payment ID: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{stripePaymentId}</span>
        </p>
        <Link 
          href="/dashboard/tenant/leases"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Go to My Leases <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
