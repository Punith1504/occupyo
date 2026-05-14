import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import { Building2, MapPin, Calendar } from "lucide-react";
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

  const lease = await prisma.lease.findUnique({
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
        <Link href="/dashboard/tenant/leases" className="text-xl font-bold text-gray-900 tracking-tight">
          Occupio <span className="font-normal text-gray-400">| Secure Checkout</span>
        </Link>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto p-6 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Order Summary */}
          <div className="flex-1 lg:max-w-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Booking</h1>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 leading-tight mb-1">{lease.property.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {lease.property.address}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(lease.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> End Date
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(lease.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl text-blue-800 text-sm leading-relaxed">
              <strong>Why a Security Deposit?</strong><br/>
              The security deposit is held to secure the space and covers the first month of occupancy. Once paid, the lease is officially Active.
            </div>
          </div>

          {/* Checkout Form */}
          <div className="flex-1 lg:max-w-xl">
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
