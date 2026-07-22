import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Building2, Calendar, FileText, ArrowRight } from "lucide-react";
import AiSearchBar from "@/components/search/AiSearchBar";
import { CommunityCard } from "@/components/dashboard/CommunityCard";

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
            property: {
              include: { images: { take: 1, orderBy: { isHero: 'desc' } } }
            }
          }
        },
        spaceRequests: true,
      },
    });
  } catch (error) {
    console.error("Database connection failed, likely during build:", error);
  }

  if (!user || (user.role as string) !== "TENANT" && (user.role as string) !== "ADMIN" && (user.role as string) !== "ADMIN") {
    if (process.env.NODE_ENV === "production" && !userId) {
       return <div>Loading...</div>; // Bypass build-time redirect
    }
    redirect("/onboarding");
  }

  const { leases, spaceRequests } = user;

  return (
    <div className="p-8 relative min-h-screen">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-[#a1ebd6] opacity-10 rounded-full blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-[40rem] h-[40rem] bg-[#b4e6ff] opacity-10 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="mb-8" style={{ animation: 'staggerFadeUp 0.5s ease-out both' }}>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user.companyName || 'Tenant'}</h1>
        <p className="text-white/60 mt-1">Manage your flexible workspaces and leases</p>
      </div>

      <div className="mb-10" style={{ animation: 'staggerFadeUp 0.5s ease-out 0.1s both' }}>
        <AiSearchBar />
      </div>

      {leases.length === 0 ? (
        <div className="liquid-glass p-12 text-center flex flex-col items-center justify-center mb-8 min-h-[300px]" style={{ animation: 'staggerFadeUp 0.5s ease-out 0.2s both' }}>
          <div className="bg-white/10 h-20 w-20 rounded-2xl border border-white/20 flex items-center justify-center mb-6 shadow-inner">
            <Search className="h-10 w-10 text-white/50" />
          </div>
          <h3 className="text-xl font-semibold text-white">No active leases</h3>
          <p className="text-white/60 mt-2 mb-8 max-w-md mx-auto">
            Ready to find your next workspace? Browse our network of premium, flexible commercial properties.
          </p>
          <Link 
            href="/dashboard/tenant/search"
            className="glass-button flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Your Active Leases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leases.map((lease, idx) => (
              <div 
                key={lease.id} 
                className="glass-card overflow-hidden group flex flex-col h-full"
                style={{ animation: `staggerFadeUp 0.5s ease-out ${0.2 + idx * 0.08}s both` }}
              >
                {/* Image Thumbnail */}
                <div className="h-40 bg-white/5 border-b border-[var(--glass-border)] relative overflow-hidden">
                  {lease.property.images && lease.property.images.length > 0 ? (
                    <img 
                      src={lease.property.images[0].url} 
                      alt={lease.property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20">
                      <Building2 className="h-10 w-10 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white truncate pr-4 text-lg">{lease.property.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#a1ebd6]/20 text-[#a1ebd6] border border-[#a1ebd6]/30 whitespace-nowrap">
                      {lease.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mb-4 truncate">{lease.property.address}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-[#b4e6ff] mb-4 bg-[#b4e6ff]/10 p-2.5 rounded-lg border border-[#b4e6ff]/20">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="bg-black/20 px-5 py-4 border-t border-white/10 flex justify-between items-center backdrop-blur-md">
                  <span className="text-sm font-semibold text-white">${lease.totalAmount.toLocaleString()} <span className="text-white/50 font-normal">total</span></span>
                  <Link href={`/dashboard/tenant/leases/${lease.id}`} className="text-sm font-medium text-[#a1ebd6] hover:text-white transition-colors flex items-center gap-1 group/link">
                    View Details <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" style={{ animation: 'staggerFadeUp 0.5s ease-out 0.4s both' }}>
        <div className="glass-card p-8 flex flex-col justify-between group">
          <div>
            <div className="h-14 w-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <Building2 className="h-7 w-7 text-[#a1ebd6]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Search Properties</h3>
            <p className="text-white/60 mb-8 max-w-sm">Find exactly what you need in our extensive marketplace.</p>
          </div>
          <Link href="/dashboard/tenant/search" className="glass-button-secondary inline-flex w-max flex items-center gap-2 group/btn">
            Start browsing <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="glass-card p-8 flex flex-col justify-between group">
          <div>
            <div className="h-14 w-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <FileText className="h-7 w-7 text-[#b4e6ff]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Post a Space Request</h3>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          {/* eslint-disable-next-line react/no-unescaped-entities */}
            <p className="text-white/60 mb-8 max-w-sm">Can't find what you're looking for? Let owners bid on your request.</p>
          </div>
          <Link href="/dashboard/tenant/requests/new" className="glass-button-secondary inline-flex w-max flex items-center gap-2 group/btn">
            Create request <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div style={{ animation: 'staggerFadeUp 0.5s ease-out 0.5s both' }}>
        <CommunityCard />
      </div>
    </div>
  );
}
