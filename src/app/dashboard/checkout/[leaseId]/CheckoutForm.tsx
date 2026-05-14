"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { createStripeCheckoutSession } from "../stripe-actions";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutForm({ 
  leaseId, 
  amount, 
  propertyName 
}: { 
  leaseId: string;
  amount: number;
  propertyName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    const result = await createStripeCheckoutSession(leaseId);
    
    if (!result.success || !result.sessionId) {
      setError(result.error || "Failed to initialize payment.");
      setLoading(false);
      return;
    }

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    if (!stripe) {
      setError("Stripe failed to load. Please try again.");
      setLoading(false);
      return;
    }

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: result.sessionId,
    });

    if (stripeError) {
      setError(stripeError.message || "Payment redirect failed.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-500 text-sm">Secure payment for {propertyName}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Stripe Branding */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Stripe Secure Checkout</p>
            <p className="text-xs text-gray-500">You will be redirected to Stripe's secure payment page</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL encrypted · PCI DSS compliant</span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between font-medium text-gray-900">
          <span>Security Deposit (First Month)</span>
          <span>${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-medium text-gray-900">
          <span>Platform Fee (2%)</span>
          <span>${(amount * 0.02).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
          <span>Total</span>
          <span>${(amount * 1.02).toLocaleString()}</span>
        </div>
      </div>

      <button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-black/10"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirecting to Stripe...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ${(amount * 1.02).toLocaleString()} with Stripe
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Powered by Stripe · Test mode enabled
      </p>
    </div>
  );
}
