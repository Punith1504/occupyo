import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, XCircle, ShieldCheck, Building2 } from "lucide-react";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage(
  props: {
    searchParams: Promise<{ payment_intent?: string; lease_id?: string; session_id?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const paymentIntentId = searchParams.payment_intent;
  const leaseId = searchParams.lease_id;

  // Backward compat: if old session_id param is passed, redirect to dashboard
  if (!paymentIntentId || !leaseId) {
    redirect("/dashboard");
  }

  // Verify with Stripe that the PaymentIntent succeeded
  let paymentSucceeded = false;
  let paymentAmount = 0;
  let propertTitle = "";

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      paymentSucceeded = true;
      paymentAmount = paymentIntent.amount_received / 100;

      // Idempotent update: if webhook already fired, this is a no-op
      const lease = await prisma.booking.update({
        where: { id: leaseId },
        data: {
          status: "ACTIVE",
          stripePaymentId: paymentIntentId,
        },
        include: { property: true },
      });

      propertTitle = lease.property.title;

      // Upsert Payment to prevent duplicate if webhook already fired
      await prisma.payment.upsert({
        where: { bookingId: leaseId },
        update: {
          stripePaymentIntentId: paymentIntentId,
          status: "PAID",
        },
        create: {
          bookingId: leaseId,
          stripePaymentIntentId: paymentIntentId,
          status: "PAID",
          amount: paymentAmount,
          currency: paymentIntent.currency.toUpperCase(),
        },
      });
    }
  } catch (error) {
    console.error("Error verifying Stripe PaymentIntent:", error);
  }

  if (!paymentSucceeded) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/3 left-1/3 w-[30rem] h-[30rem] bg-red-500 opacity-[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="liquid-glass rounded-3xl p-12 text-center max-w-lg w-full relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50" />
          
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Payment Unverified</h1>
          <p className="text-white/60 mb-8 leading-relaxed">
            We couldn&apos;t verify your payment with Stripe. If you were charged, please contact support.
          </p>
          <Link
            href="/dashboard/tenant/leases"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/15 transition-colors"
          >
            Back to Leases <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-emerald-400 opacity-[0.03] rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#b4e6ff] opacity-[0.03] rounded-full blur-[100px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="liquid-glass rounded-3xl p-12 text-center max-w-lg w-full relative overflow-hidden">
        {/* Top glow bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

        {/* Success icon */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(52,211,153,0.15)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Payment Successful!</h1>
        <p className="text-white/60 mb-2 leading-relaxed">
          Your security deposit has been processed and your lease is now <strong className="text-emerald-400">Active</strong>.
        </p>

        {propertTitle && (
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm mb-6">
            <Building2 className="w-4 h-4" />
            <span>{propertTitle}</span>
          </div>
        )}

        {/* Payment details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Amount Paid</span>
            <span className="text-white font-medium">${paymentAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Payment ID</span>
            <span className="font-mono text-xs text-white/40 truncate max-w-[200px]">{paymentIntentId}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-white/30 mb-8">
          <ShieldCheck className="w-4 h-4" />
          <span>Secured by Stripe. Escrow protection active.</span>
        </div>

        <Link
          href="/dashboard/tenant/leases"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#b4e6ff] to-[#cbb4ff] text-black px-8 py-3.5 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(180,230,255,0.3)] hover:scale-[1.02] transition-all duration-300"
        >
          Go to My Leases <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
