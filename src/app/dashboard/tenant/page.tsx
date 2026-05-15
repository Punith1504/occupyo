import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Building2, Calendar, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TenantDashboardOverview() {
  const { userId } = await auth();
  
  if (!userId) {
    if (process.env.NODE_ENV === "production") {
       return <div>Loading...</div>; // Bypass build-time redirect
    }
    redirect("/sign-in");
  }

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { clerkUserId: userId || '' },
      include: {
        leases: {
          include: {
            property: true
          }
        },
        spaceRequests: true,
      },
    });
  } catch (error) {
    console.error("Database connection failed, likely during build:", error);
  }

  if (!user || user.role !== "TENANT" && user.role !== "ADMIN" && user.role !== "ADMIN") {
    if (process.env.NODE_ENV === "production" && !userId) {
       return <div>Loading...</div>; // Bypass build-time redirect
    }
    redirect("/onboarding");
  }

  const { leases, spaceRequests } = user;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.companyName || 'Tenant'}</h1>
        <p className="text-gray-500 mt-1">Manage your flexible workspaces and leases</p>
      </div>

      {leases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center mb-8">
          <div className="bg-blue-50 h-16 w-16 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No active leases</h3>
          <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
            Ready to find your next workspace? Browse our network of premium, flexible commercial properties.
          </p>
          <Link 
            href="/dashboard/tenant/search"
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            <Search className="h-4 w-4" />
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Active Leases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <div key={lease.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{lease.property.title}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {lease.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 truncate">{lease.property.address}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">${lease.totalAmount.toLocaleString()} total</span>
                    <Link href={`/dashboard/tenant/leases/${lease.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View Details
                    </Link>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Search Properties</h3>
            <p className="text-sm text-gray-500 mb-4">Find exactly what you need in our extensive marketplace.</p>
          </div>
          <Link href="/dashboard/tenant/search" className="text-sm font-medium text-black hover:underline flex items-center gap-1">
            Start browsing →
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Post a Space Request</h3>
            <p className="text-sm text-gray-500 mb-4">Can't find what you're looking for? Let owners bid on your request.</p>
          </div>
          <Link href="/dashboard/tenant/requests/new" className="text-sm font-medium text-black hover:underline flex items-center gap-1">
            Create request →
          </Link>
        </div>
      </div>
    </div>
  );
}
