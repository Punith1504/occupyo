import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Building2, MapPin, Search, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TenantLeasesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      leases: {
        include: { property: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user || (user.role as string) !== "TENANT" && (user.role as string) !== "ADMIN" && (user.role as string) !== "ADMIN") redirect("/onboarding");

  const leases = user.leases;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Leases</h1>
        <p className="text-gray-500 mt-1">Manage your active and pending workspace bookings.</p>
      </div>

      {leases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
            You haven't requested to book any properties yet.
          </p>
          <Link 
            href="/dashboard/tenant/search"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            <Search className="h-4 w-4" />
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {leases.map((lease) => {
            const isApproved = lease.status === "APPROVED";
            
            return (
              <div key={lease.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                      ${lease.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        lease.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {lease.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Requested {new Date(lease.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lease.property.title}</h3>
                  <p className="text-gray-500 flex items-center gap-1 text-sm mb-6">
                    <MapPin className="w-4 h-4" /> {lease.property.address}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Start Date</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(lease.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">End Date</p>
                      <p className="font-medium text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(lease.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Monthly Rent</p>
                      <p className="font-medium text-gray-900">${lease.property.pricePerMonth.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                      <p className="font-bold text-gray-900">${lease.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col justify-center">
                  {lease.status === "PENDING" && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Waiting for Owner Approval</p>
                      <p className="text-xs text-gray-400">You will be notified when the owner responds.</p>
                    </div>
                  )}

                  {lease.status === "APPROVED" && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 mb-3">Owner approved! Finalize booking.</p>
                      <Link 
                        href={`/dashboard/checkout/${lease.id}`}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                      >
                        <Lock className="w-4 h-4" />
                        Pay Deposit
                      </Link>
                    </div>
                  )}

                  {lease.status === "ACTIVE" && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Lease Active</p>
                      <p className="text-xs text-gray-500 mt-1">Payment ID: {lease.stripePaymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
