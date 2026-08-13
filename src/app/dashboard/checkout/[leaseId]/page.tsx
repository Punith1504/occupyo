import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import { Building2, MapPin, Calendar, Lock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheckoutPage(
  props: {
    params: Promise<{ leaseId: string }>;
  }
) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) redirect("/onboarding");

  const lease = await prisma.booking.findUnique({
    where: { id: params.leaseId },
    include: {
      property: true,
      tenant: true,
    }
  });

  if (!lease) notFound();

  // Security checks
  if (lease.tenantId !== user.id) redirect("/dashboard");
  if (lease.status === "ACTIVE") redirect("/dashboard/tenant/leases");
  if (lease.status !== "APPROVED") redirect("/dashboard/tenant/leases");

  const monthlyRent = lease.property.pricePerMonth;

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Premium Glassmorphic Background Artifacts */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-[#b4e6ff] opacity-[0.03] rounded-full blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#cbb4ff] opacity-[0.03] rounded-full blur-[100px] mix-blend-screen animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="w-full max-w-6xl mx-auto z-10 flex flex-col">
        <header className="mb-10 flex items-center">
          <Link href="/dashboard/tenant/leases" className="text-2xl font-bold text-white tracking-tight">
            Occupyo <span className="font-light text-white/40">| Secure Checkout</span>
          </Link>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Order Summary */}
          <div className="flex-1 lg:max-w-md animate-fadeRight">
            <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">Complete Booking</h1>
            
            <div className="liquid-glass rounded-3xl p-6 md:p-8 mb-6">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-[#b4e6ff]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white leading-tight mb-1">{lease.property.title}</h3>
                  <p className="text-sm text-white/50 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {lease.property.address}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-4 border-t border-white/10">
                  <span className="text-white/60 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#b4e6ff]" /> Start Date
                  </span>
                  <span className="font-medium text-white">
                    {new Date(lease.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-t border-white/10 border-b">
                  <span className="text-white/60 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#b4e6ff]" /> End Date
                  </span>
                  <span className="font-medium text-white">
                    {new Date(lease.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#b4e6ff]/10 border border-[#b4e6ff]/20 p-5 rounded-2xl text-[#b4e6ff] text-sm leading-relaxed backdrop-blur-md flex items-start gap-3 shadow-[0_0_20px_rgba(180,230,255,0.1)]">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-1">Escrow Protection Guarantee</strong>
                The security deposit is held securely by Stripe. Once paid, the lease is officially Active and your space is secured.
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="flex-1 w-full animate-fadeLeft">
            <CheckoutForm 
              leaseId={lease.id} 
              amount={monthlyRent} 
              propertyName={lease.property.title} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
