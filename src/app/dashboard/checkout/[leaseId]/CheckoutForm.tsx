"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe outside of component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutInnerForm({ amount, leaseId }: { amount: number, leaseId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError("");

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred.");
      setLoading(false);
      return;
    }

    // Confirm the payment
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/tenant/leases`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || "Payment confirmation failed.");
      setLoading(false);
    }
    // If successful, Stripe automatically redirects to the return_url.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium animate-elasticBounce">
          {error}
        </div>
      )}

      <div className="bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5">
        <PaymentElement options={{
           layout: "tabs",
           // Use the "night" theme to blend seamlessly with our glassmorphism
           appearance: {
             theme: "night",
             variables: {
               colorPrimary: "#b4e6ff",
               colorBackground: "transparent",
               colorText: "#ffffff",
               colorDanger: "#ef4444",
               fontFamily: "inherit",
               spacingUnit: "4px",
               borderRadius: "12px",
               colorTextPlaceholder: "#64748b"
             },
             rules: {
               ".Input": {
                 backgroundColor: "rgba(255, 255, 255, 0.03)",
                 border: "1px solid rgba(255, 255, 255, 0.1)",
                 boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)",
               },
               ".Input:focus": {
                 border: "1px solid rgba(180, 230, 255, 0.5)",
                 boxShadow: "0 0 0 1px rgba(180, 230, 255, 0.5)",
               },
               ".Label": {
                 color: "rgba(255, 255, 255, 0.8)",
                 fontWeight: "500",
               }
             }
           }
        }} />
      </div>

      <button 
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full bg-gradient-to-r from-[#b4e6ff] to-[#cbb4ff] text-black py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(180,230,255,0.3)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Securely...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${(amount * 1.02).toLocaleString()}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-white/40">
        <ShieldCheck className="w-4 h-4" />
        <span>Payments are processed securely by Stripe.</span>
      </div>
    </form>
  );
}

export default function CheckoutForm({ 
  leaseId, 
  amount, 
  propertyName 
}: { 
  leaseId: string;
  amount: number;
  propertyName: string;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const [initError, setInitError] = useState("");

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const res = await fetch("/api/checkout/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leaseId }),
        });
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to initialize checkout");
        }
        
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setInitError(err.message);
      }
    };
    
    fetchIntent();
  }, [leaseId]);

  return (
    <div className="liquid-glass rounded-3xl p-6 md:p-8 w-full shadow-2xl relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#b4e6ff] to-transparent opacity-50" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Payment Details</h2>
        <p className="text-white/50 text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Secure payment for {propertyName}
        </p>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between font-medium text-white/80">
          <span>Security Deposit (First Month)</span>
          <span>${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-medium text-white/80">
          <span>Platform Fee (2%)</span>
          <span>${(amount * 0.02).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-2xl font-bold text-white pt-4 border-t border-white/10">
          <span>Total</span>
          <span className="text-[#b4e6ff]">${(amount * 1.02).toLocaleString()}</span>
        </div>
      </div>

      {initError ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
          {initError}
        </div>
      ) : !clientSecret ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#b4e6ff] animate-spin mb-4" />
          <p className="text-white/50 text-sm animate-pulse">Initializing secure connection...</p>
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
          <CheckoutInnerForm amount={amount} leaseId={leaseId} />
        </Elements>
      )}
    </div>
  );
}
