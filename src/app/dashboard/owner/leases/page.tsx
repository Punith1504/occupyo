import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, DollarSign, Building2, User } from "lucide-react";
import { LeaseActionButtons } from "./LeaseActionButtons";

export const dynamic = "force-dynamic";

export default async function OwnerLeasesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    if (process.env.NODE_ENV === "production") return <div>Loading...</div>;
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId || '' }
  });

  if (!user || (user.role as string) !== "OWNER" && (user.role as string) !== "ADMIN" && (user.role as string) !== "ADMIN") {
    if (process.env.NODE_ENV === "production" && !userId) return <div>Loading...</div>;
    redirect("/onboarding");
  }

  // Fetch all leases for properties owned by this user
  const leases = await prisma.lease.findMany({
    where: {
      property: {
        ownerId: user.id
      }
    },
    include: {
      property: true,
      tenant: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const pendingLeases = leases.filter(l => l.status === "PENDING");
  const activeLeases = leases.filter(l => l.status === "ACTIVE" || l.status === "APPROVED");
  const pastLeases = leases.filter(l => l.status === "COMPLETED" || l.status === "REJECTED");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lease Management</h1>
        <p className="text-gray-500 mt-1">Review and manage booking requests for your properties.</p>
      </div>

      <div className="space-y-10">
        
        {/* Pending Requests Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            Pending Requests ({pendingLeases.length})
          </h2>
          
          {pendingLeases.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No pending requests at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingLeases.map((lease) => (
                <div key={lease.id} className="bg-white rounded-xl border border-yellow-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 uppercase">New Request</span>
                      <span className="text-sm text-gray-500">{new Date(lease.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{lease.property.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{lease.tenant.companyName || lease.tenant.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">${lease.totalAmount.toLocaleString()}</p>
                    </div>
                    <LeaseActionButtons leaseId={lease.id} />
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Leases Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Active Leases ({activeLeases.length})
          </h2>
          
          {activeLeases.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No active leases.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLeases.map((lease) => (
                <div key={lease.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 truncate">{lease.property.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                         <User className="w-3.5 h-3.5" />
                         {lease.tenant.companyName || lease.tenant.email}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {lease.status}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contract Value</p>
                      <p className="font-medium text-gray-900">${lease.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
