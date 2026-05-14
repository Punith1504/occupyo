import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MapPin, DollarSign, Calendar, Mail, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerSpaceRequestsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    if (process.env.NODE_ENV === "production") return <div>Loading...</div>;
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId || '' }
  });

  if (!user || user.role !== "OWNER") {
    if (process.env.NODE_ENV === "production" && !userId) return <div>Loading...</div>;
    redirect("/onboarding");
  }

  // Fetch all open space requests
  let requests: any[] = [];
  try {
    requests = await prisma.spaceRequest.findMany({
      where: { status: "OPEN" },
      include: {
        tenant: {
          select: { companyName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching open space requests:", error);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tenant Requests</h1>
        <p className="text-gray-500 mt-1">Browse what tenants are actively looking for. Have a space that matches? Reach out!</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-500">
          No open tenant requests at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase bg-blue-100 text-blue-800">
                    {req.requiredType}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Posted {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Looking For Space</span>
              </div>
              
              <div className="flex-1 space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {req.city}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><ExpandIcon /> Min Size</p>
                    <p className="font-semibold text-gray-900">{req.minSqft.toLocaleString()} sqft</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Max Budget</p>
                    <p className="font-semibold text-gray-900">${req.maxBudget.toLocaleString()}/mo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Expected term: <strong>{req.durationMonths} months</strong></span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-auto">
                <p className="text-xs text-gray-500 mb-2 uppercase font-semibold tracking-wide">Tenant Details</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{req.tenant.companyName || 'Verified Tenant'}</span>
                  </div>
                  <Link 
                    href={`/dashboard/messages/${req.tenantId}`}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"></polyline>
      <polyline points="9 21 3 21 3 15"></polyline>
      <line x1="21" y1="3" x2="14" y2="10"></line>
      <line x1="3" y1="21" x2="10" y2="14"></line>
    </svg>
  );
}
