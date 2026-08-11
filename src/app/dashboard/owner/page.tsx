import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Building, MapPin, ArrowUpRight } from "lucide-react";
import { redirect } from "next/navigation";
import { CommunityCard } from "@/components/dashboard/CommunityCard";
import { YieldAnalytics } from "./YieldAnalytics";
import { getOwnerAnalytics } from "./analytics-actions";
import { PropertyTimeline } from "@/components/dashboard/PropertyTimeline";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardOverview() {
  const { userId } = await auth();
  if (!userId) {
    if (process.env.NODE_ENV === "production") {
       return <div>Loading...</div>;
    }
    redirect("/sign-in");
  }

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { clerkUserId: userId || '' },
      include: { properties: { include: { images: { take: 1, orderBy: { isHero: 'desc' } } } } },
    });
  } catch (error) {
    console.error("Database connection failed, likely during build:", error);
  }

  if (!user || ((user.role as string) !== "OWNER" && (user.role as string) !== "BROKER" && (user.role as string) !== "ADMIN")) {
    if (process.env.NODE_ENV === "production" && !userId) {
       return <div>Loading...</div>;
    }
    redirect("/onboarding");
  }

  const properties = user.properties;
  const analyticsData = await getOwnerAnalytics();
  
  let activityLogs: any[] = [];
  try {
    activityLogs = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  } catch (error) {
    console.error("Failed to fetch activity logs", error);
  }

  return (
    <div className="p-8 relative min-h-screen">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-[#cbb4ff] opacity-10 rounded-full blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-teal-500 opacity-5 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="flex justify-between items-center mb-8" style={{ animation: 'staggerFadeUp 0.5s ease-out both' }}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user.companyName || 'Owner'}</h1>
          <p className="text-gray-500 mt-1">Manage your flexible spaces and leases</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/create"
          className="glass-button flex items-center gap-2 !py-2.5 !px-5 !rounded-xl !text-sm active:scale-95 transition-transform bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      <YieldAnalytics data={analyticsData} />

      {properties.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md shadow-sm border border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]" style={{ animation: 'staggerFadeUp 0.5s ease-out 0.1s both' }}>
          <div className="bg-gray-100 h-20 w-20 rounded-2xl border border-gray-200 flex items-center justify-center mb-6 shadow-sm">
            <Building className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No properties yet</h3>
          <p className="text-gray-500 mt-2 mb-8 max-w-md">
            Get started by adding your first flexible space. It takes just a few minutes.
          </p>
          <Link 
            href="/dashboard/owner/listings/create"
            className="glass-button flex items-center gap-2 bg-teal-500 text-white border-transparent hover:bg-teal-600 shadow-md"
          >
            <PlusCircle className="h-5 w-5" />
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, idx) => (
            <div 
              key={property.id} 
              className="bg-white/60 backdrop-blur-md shadow-sm border border-gray-200 rounded-3xl overflow-hidden group flex flex-col h-full hover:border-teal-500/30 transition-colors"
              style={{ animation: `staggerFadeUp 0.5s ease-out ${0.1 + idx * 0.08}s both` }}
            >
              {/* Image Thumbnail */}
              <div className="h-48 bg-gray-100 border-b border-gray-200 relative overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0].url} 
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <Building className="h-10 w-10 opacity-50" />
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate pr-4 text-lg">{property.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
                    {property.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-6 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {property.address}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-6 flex-1">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-gray-500 text-xs mb-1">Size</p>
                    <p className="font-medium text-gray-900">{property.sizeSqft.toLocaleString()} sqft</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                    <p className="text-teal-700 text-xs mb-1">Price</p>
                    <p className="font-medium text-teal-800">${property.pricePerMonth.toLocaleString()}/mo</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <Link href={`/dashboard/owner/listings/${property.id}`} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex-1 text-center !py-2 !px-0 rounded-xl text-sm font-medium active:scale-95 transition-transform">
                    Edit
                  </Link>
                  <Link href={`/property/${property.id}`} className="bg-gray-900 text-white hover:bg-gray-800 flex-1 text-center !py-2 !px-0 rounded-xl text-sm font-medium flex items-center justify-center gap-1 active:scale-95 transition-transform">
                    View <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PropertyTimeline events={JSON.parse(JSON.stringify(activityLogs))} />

      <CommunityCard />
    </div>
  );
}
