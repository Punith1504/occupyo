import { prisma } from "@/lib/prisma";
import { Building2, Store, Factory, Briefcase, Users, HeartPulse } from "lucide-react";
import Link from "next/link";
import AiSearchBar from "@/components/search/AiSearchBar";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Testimonials } from "@/components/home/Testimonials";
import { PropertyCard } from "@/components/search/PropertyCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const properties = await prisma.property.findMany({
    where: { status: "AVAILABLE" },
    include: {
      images: {
        orderBy: { isHero: 'desc' }
      }
    },
    take: 12,
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#060608]">
      {/* 1. Navigation Bar (Liquid Glass) */}
      <header className="sticky top-0 z-50 fluted-glass !rounded-none !border-x-0 !border-t-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 py-6 md:px-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-md">
              <Building2 className="text-[#a1ebd6] h-8 w-8" /> Occupyo
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard/owner" className="px-5 py-3 text-base font-bold text-gray-300 hover:text-white transition-colors">Post Space</Link>
            <Link href="/dashboard/tenant" className="px-6 py-3 text-base font-bold bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md">Rent Space</Link>
          </div>
        </div>
      </header>

      {/* 2. Massive Hero Image Banner with Central Search Widget */}
      <div className="relative w-full h-[85vh] min-h-[600px] md:min-h-[750px] flex flex-col items-center justify-center overflow-hidden py-12 md:py-16">
        <HeroCarousel />

        <div className="relative z-10 text-center px-4 w-full mb-8 md:mb-12 mt-12 md:mt-0">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-3 md:mb-4 drop-shadow-lg tracking-tight leading-tight">
            The Intelligent CRE Marketplace
          </h1>
          <p className="text-white/90 text-lg md:text-2xl font-medium drop-shadow-md max-w-3xl mx-auto">
            Discover the perfect space for your business.
          </p>
        </div>

        {/* The Central Pristine Glass Widget */}
        <div className="relative z-10 w-full max-w-6xl px-4 md:mt-6">
          <div className="fluted-glass rounded-[32px] p-5 md:p-12 lg:p-16 flex flex-col border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            
            {/* Tabs - Match uploaded image style */}
            <div className="flex items-center gap-6 md:gap-8 w-fit border border-white/20 bg-black/20 backdrop-blur-md rounded-full px-8 py-3 mb-6 shadow-inner">
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <span className="text-white font-bold text-sm md:text-base tracking-wide whitespace-nowrap drop-shadow-sm">Rent Space</span>
                <div className="w-full h-[3px] bg-[#a1ebd6] rounded-full shadow-[0_0_8px_rgba(161,235,214,0.6)] mt-[2px]"></div>
              </div>
              <button className="text-gray-300 font-medium text-sm md:text-base whitespace-nowrap hover:text-white transition-all pb-[5px]">Post Space</button>
              <button className="text-gray-300 font-medium text-sm md:text-base whitespace-nowrap hover:text-white transition-all pb-[5px]">Enterprise Solutions</button>
            </div>

            {/* Property Types - Minimalist Icons */}
            <div className="flex items-center gap-6 md:gap-10 w-full mt-6 mb-6 overflow-x-auto pb-2">
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <Building2 className="w-8 h-8 text-gray-300 group-hover:text-[#a1ebd6] transition-colors" strokeWidth={1.5} />
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider group-hover:text-[#a1ebd6] transition-colors drop-shadow-sm">Office</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <Store className="w-8 h-8 text-gray-300 group-hover:text-[#a1ebd6] transition-colors" strokeWidth={1.5} />
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider group-hover:text-[#a1ebd6] transition-colors drop-shadow-sm">Retail</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <Factory className="w-8 h-8 text-gray-300 group-hover:text-[#a1ebd6] transition-colors" strokeWidth={1.5} />
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider group-hover:text-[#a1ebd6] transition-colors drop-shadow-sm">Industrial</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer group">
                <Briefcase className="w-8 h-8 text-gray-300 group-hover:text-[#a1ebd6] transition-colors" strokeWidth={1.5} />
                <span className="text-gray-300 text-xs font-semibold uppercase tracking-wider group-hover:text-[#a1ebd6] transition-colors drop-shadow-sm">Flex</span>
              </div>
            </div>

            {/* AI Search Bar */}
            <div className="w-full">
              <AiSearchBar />
            </div>

          </div>
        </div>
      </div>

      {/* 3. Featured Properties Section */}
      <div className="w-full py-24 px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Featured Spaces</h2>
            <Link href="/search" className="text-[#a1ebd6] font-semibold hover:text-white flex items-center gap-1 transition-colors text-lg">
              View All <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          
          {properties.length === 0 ? (
            <div className="text-center py-20 liquid-glass">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-white">No properties</h3>
              <p className="mt-1 text-sm text-gray-400">Check back later for new listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {properties.map((property, index) => {
                // Make the first item and the 6th item span 2 columns to create a dynamic masonry/bento layout
                const isHorizontal = index === 0 || index === 5;
                return (
                  <div key={property.id} className={isHorizontal ? "col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2" : "col-span-1"}>
                    <PropertyCard property={property} variant="home" isHorizontal={isHorizontal} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Trust Signals & Testimonials */}
      <div className="w-full border-t border-white/10 py-16 px-4 bg-[#080b13]">
        <TrustSignals />
      </div>

      <div className="w-full py-20 bg-[#060608]">
        <Testimonials />
      </div>
    </div>
  );
}
