import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Building } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardOverview() {
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
      include: { properties: true },
    });
  } catch (error) {
    console.error("Database connection failed, likely during build:", error);
  }

  if (!user || user.role !== "OWNER") {
    if (process.env.NODE_ENV === "production" && !userId) {
       return <div>Loading...</div>; // Bypass build-time redirect
    }
    redirect("/onboarding");
  }

  const properties = user.properties;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.companyName || 'Owner'}</h1>
          <p className="text-gray-500 mt-1">Manage your flexible spaces and leases</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/create"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No properties yet</h3>
          <p className="text-gray-500 mt-1 mb-6 max-w-sm">
            Get started by adding your first flexible space. It takes just a few minutes.
          </p>
          <Link 
            href="/dashboard/owner/listings/create"
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            <PlusCircle className="h-5 w-5" />
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
              <div className="h-48 bg-gray-100 relative">
                {/* Fallback image if no images */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <Building className="h-10 w-10 opacity-20" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate pr-4">{property.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {property.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 truncate">{property.address}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Size</p>
                    <p className="font-medium text-gray-900">{property.sizeSqft.toLocaleString()} sqft</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Price</p>
                    <p className="font-medium text-gray-900">${property.pricePerMonth.toLocaleString()}/mo</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <Link href={`/dashboard/owner/listings/${property.id}`} className="flex-1 text-center bg-gray-50 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
                    Edit
                  </Link>
                  <Link href={`/property/${property.id}`} className="flex-1 text-center bg-white border border-gray-200 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                    View Public
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
