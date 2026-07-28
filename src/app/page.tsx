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
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF7]">
      {/* 1. Navigation Bar (Liquid Glass) */}
      <header className="sticky top-0 z-50 fluted-glass !rounded-none !border-x-0 !border-t-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 py-6 md:px-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3 drop-shadow-sm">
              <Building2 className="text-teal-600 h-8 w-8" /> Occupyo
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard/owner" className="px-5 py-3 text-base font-bold text-gray-600 hover:text-gray-900 transition-colors">Post Space</Link>
            <Link href="/dashboard/tenant" className="px-6 py-3 text-base font-bold bg-white/60 border border-gray-200 text-gray-900 rounded-xl hover:bg-white transition-colors backdrop-blur-md shadow-sm">Rent Space</Link>
          </div>
        </div>
      </header>

      {/* 2. Massive Hero Image Banner with Central Search Widget */}
      <div className="relative w-full h-[85vh] min-h-[600px] md:min-h-[750px] flex flex-col items-center justify-center overflow-hidden py-12 md:py-16">
        <HeroCarousel />

        <div className="relative z-10 text-center px-4 w-full mb-12 md:mb-16 mt-16 md:mt-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-6 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            Next Generation Commercial Real Estate
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-extrabold mb-6 tracking-tight leading-[1.1] drop-shadow-sm text-gray-900">
            The <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600">Intelligent</span><br className="hidden md:block"/> CRE Marketplace
          </h1>
          
          <p className="text-gray-600 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            Discover the perfect space for your business with AI-powered matching and premium flex occupancy.
          </p>
        </div>

        {/* The Central Pristine Glass Widget */}
        <div className="relative z-10 w-full max-w-6xl px-4 md:px-8 md:mt-8">
          <div className="bg-white/70 backdrop-blur-3xl rounded-[32px] p-6 md:p-14 lg:p-20 flex flex-col border border-white shadow-xl relative overflow-hidden">
            {/* Subtle inner highlight for true glass feel */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[32px]"></div>
            
            {/* Tabs - Match uploaded image style */}
            <div className="flex flex-wrap items-center gap-6 md:gap-10 w-fit border border-gray-200 bg-white/60 backdrop-blur-md rounded-full px-8 py-4 md:px-10 mb-8 shadow-sm relative z-20">
              <Link href="/" className="flex flex-col items-center gap-1 cursor-pointer">
                <span className="text-gray-900 font-bold text-xs md:text-base tracking-wide whitespace-nowrap drop-shadow-sm">Rent Space</span>
                <div className="w-full h-[3px] bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.4)] mt-[2px]"></div>
              </Link>
              <Link href="/dashboard/owner" className="text-gray-500 font-medium text-xs md:text-base whitespace-nowrap hover:text-gray-900 transition-colors pb-[5px]">Post Space</Link>
              <Link href="/enterprise" className="text-gray-500 font-medium text-xs md:text-base whitespace-nowrap hover:text-gray-900 transition-colors pb-[5px]">Enterprise Solutions</Link>
            </div>

            {/* Property Types - Minimalist Icons */}
            <div className="flex items-center justify-start md:justify-start gap-8 md:gap-12 w-full mt-8 mb-10 overflow-x-auto pb-4 relative z-20">
              <Link href="/search?type=OFFICE" className="flex flex-col items-center gap-3 cursor-pointer group">
                <Building2 className="w-10 h-10 text-gray-400 group-hover:text-teal-500 transition-colors" strokeWidth={1.5} />
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider group-hover:text-teal-600 transition-colors drop-shadow-sm">Office</span>
              </Link>
              <Link href="/search?type=RETAIL" className="flex flex-col items-center gap-3 cursor-pointer group">
                <Store className="w-10 h-10 text-gray-400 group-hover:text-teal-500 transition-colors" strokeWidth={1.5} />
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider group-hover:text-teal-600 transition-colors drop-shadow-sm">Retail</span>
              </Link>
              <Link href="/search?type=INDUSTRIAL" className="flex flex-col items-center gap-3 cursor-pointer group">
                <Factory className="w-10 h-10 text-gray-400 group-hover:text-teal-500 transition-colors" strokeWidth={1.5} />
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider group-hover:text-teal-600 transition-colors drop-shadow-sm">Industrial</span>
              </Link>
              <Link href="/search?type=FLEX" className="flex flex-col items-center gap-3 cursor-pointer group">
                <Briefcase className="w-10 h-10 text-gray-400 group-hover:text-teal-500 transition-colors" strokeWidth={1.5} />
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider group-hover:text-teal-600 transition-colors drop-shadow-sm">Flex</span>
              </Link>
            </div>

            {/* AI Search Bar */}
            <div className="w-full relative z-30">
              <AiSearchBar />
            </div>

          </div>
        </div>
      </div>

      {/* 3. Featured Properties Section */}
      <div className="w-full py-32 px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm">Featured Spaces</h2>
            <Link href="/search" className="text-teal-600 font-semibold hover:text-teal-800 flex items-center gap-1 transition-colors text-lg">
              View All <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          
          {properties.length === 0 ? (
            <div className="text-center py-24 bg-white/60 border border-gray-200 rounded-3xl shadow-sm backdrop-blur-md">
              <Building2 className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No properties</h3>
              <p className="mt-2 text-base text-gray-500">Check back later for new listings.</p>
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
      <div className="w-full border-t border-gray-200 py-24 px-4 bg-white/40 backdrop-blur-md">
        <TrustSignals />
      </div>

      <div className="w-full py-28 bg-[#FAFAF7]">
        <Testimonials />
      </div>
    </div>
  );
}
