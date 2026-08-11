import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, PlusCircle, MapPin, DollarSign, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TenantRequestsPage() {
  const { userId } = await auth();
  if (!userId) {
    if (process.env.NODE_ENV !== "production") redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId || "" }
  });

  if (!user || (user.role as string) !== "TENANT" && (user.role as string) !== "ADMIN" && (user.role as string) !== "ADMIN") {
    if (process.env.NODE_ENV === "production" && !userId) return <div>Loading...</div>;
    redirect("/onboarding");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let requests: any[] = [];
  try {
    requests = await prisma.spaceRequest.findMany({
      where: { tenantId: user.id },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching space requests:", error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Space Requests</h1>
          <p className="text-gray-500 mt-1">Manage your active requests for flexible workspace.</p>
        </div>
        <Link 
          href="/dashboard/tenant/requests/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          New Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No active requests</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
            Can't find the perfect space in our marketplace? Post a request detailing what you need and let owners reach out to you directly.
          </p>
          <Link 
            href="/dashboard/tenant/requests/new"
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
          >
            Create a Space Request
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase ${req.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {req.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {req.requiredType}
                  </span>
                  <span className="text-xs text-gray-500">
                    Posted {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{req.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Max ${req.maxBudget.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{req.durationMonths} months</span>
                  </div>
                </div>
                
                {req.description ? (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4 border border-gray-100">
                    <p className="text-sm text-gray-700 line-clamp-3">{req.description}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4 border border-gray-100 border-dashed">
                    <p className="text-sm text-gray-400 italic">No detailed description provided.</p>
                  </div>
                )}
              </div>
              
              <div className="text-right flex-shrink-0 self-start md:self-center mt-4 md:mt-0">
                <div className="text-xs text-gray-500 mb-1">Minimum Size</div>
                <div className="text-xl font-bold text-gray-900">{req.minSqft.toLocaleString()} <span className="text-sm text-gray-500 font-normal">sqft</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
