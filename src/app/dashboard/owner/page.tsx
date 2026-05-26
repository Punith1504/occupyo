import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Building } from "lucide-react";
import { redirect } from "next/navigation";
import { CommunityCard } from "@/components/dashboard/CommunityCard";

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

  if (!user || user.role !== "OWNER" && user.role !== "ADMIN" && user.role !== "ADMIN") {
    if (process.env.NODE_ENV === "production" && !userId) {
       return <div>Loading...</div>; // Bypass build-time redirect
    }
    redirect("/onboarding");
  }

  const properties = user.properties;

  return (
    <div className="p-8 relative min-h-screen">
      {/* Cinematic Background for Dashboard */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-[#cbb4ff] opacity-10 rounded-full blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-[#a1ebd6] opacity-10 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user.companyName || 'Owner'}</h1>
          <p className="text-white/60 mt-1">Manage your flexible spaces and leases</p>
        </div>
        <Link 
          href="/dashboard/owner/listings/create"
          className="glass-button flex items-center gap-2 !py-2.5 !px-5 !rounded-xl !text-sm"
        >
          <PlusCircle className="h-4 w-4" />
          New Listing
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="pure-glass p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-white/10 h-20 w-20 rounded-2xl border border-white/20 flex items-center justify-center mb-6 shadow-inner">
            <Building className="h-10 w-10 text-white/50" />
          </div>
          <h3 className="text-xl font-semibold text-white">No properties yet</h3>
          <p className="text-white/60 mt-2 mb-8 max-w-md">
            Get started by adding your first flexible space. It takes just a few minutes.
          </p>
          <Link 
            href="/dashboard/owner/listings/create"
            className="glass-button flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="glass-card overflow-hidden group flex flex-col h-full">
              <div className="h-48 bg-white/5 border-b border-[var(--glass-border)] relative">
                {/* Fallback image if no images */}
                <div className="absolute inset-0 flex items-center justify-center text-white/20">
                  <Building className="h-10 w-10 opacity-50" />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white truncate pr-4 text-lg">{property.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#a1ebd6]/20 text-[#a1ebd6] border border-[#a1ebd6]/30">
                    {property.status}
                  </span>
                </div>
                <p className="text-sm text-white/60 mb-6 truncate">{property.address}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-6 flex-1">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-white/50 text-xs mb-1">Size</p>
                    <p className="font-medium text-white">{property.sizeSqft.toLocaleString()} sqft</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-white/50 text-xs mb-1">Price</p>
                    <p className="font-medium text-[#b4e6ff]">${property.pricePerMonth.toLocaleString()}/mo</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10 flex gap-3">
                  <Link href={`/dashboard/owner/listings/${property.id}`} className="glass-button-secondary flex-1 text-center !py-2 !px-0 !rounded-xl !text-sm">
                    Edit
                  </Link>
                  <Link href={`/property/${property.id}`} className="glass-button-secondary flex-1 text-center !py-2 !px-0 !rounded-xl !text-sm">
                    View Public
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CommunityCard />
    </div>
  );
}
