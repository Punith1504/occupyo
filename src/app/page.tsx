import { prisma } from "@/lib/prisma";
import { Building2 } from "lucide-react";
import Link from "next/link";
import AiSearchBar from "@/components/search/AiSearchBar";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Testimonials } from "@/components/home/Testimonials";
import { PropertyCard } from "@/components/search/PropertyCard";

import { FlippingText } from "@/components/home/FlippingText";

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
    <div className="min-h-screen bg-[#060608] flex flex-col font-sans">
      {/* 1. Glassmorphic Navigation Bar */}
      <header className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="text-[#a1ebd6] h-6 w-6" /> Occupyo
            </Link>
          </div>
          
          <div className="flex-1 w-full max-w-2xl relative z-50">
            <AiSearchBar />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard/owner" className="neu-button px-5 py-2 text-sm font-bold text-white">Post Space</Link>
            <Link href="/dashboard/tenant" className="neu-button px-5 py-2 text-sm font-bold text-white">Rent Space</Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Image Banner */}
      <div className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Unsplash Commercial Real Estate Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" }}
        >
          {/* Light Overlay to ensure black text readability, fading to dark at the bottom to blend with the rest of the site */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#060608] to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 w-full">
          <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-4 drop-shadow-md tracking-tight">
            The Intelligent CRE Marketplace
          </h1>
          <FlippingText />
        </div>
      </div>

      {/* 2.5 Hybrid Portals (Glass, Neu, Skeuo) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 w-full mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* POST SPACE PORTAL */}
          <div className="glass-panel p-2 shadow-2xl transition-transform hover:-translate-y-2 duration-500">
            <div className="skeuo-card p-8 h-full flex flex-col items-center text-center relative overflow-hidden border border-gray-700">
              {/* Metallic Screws (Skeuo Detail) */}
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600 rotate-45"></div></div>
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600 -rotate-45"></div></div>
              <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600 rotate-90"></div></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600"></div></div>

              <div className="w-20 h-20 rounded-full bg-gray-800 shadow-inner flex items-center justify-center mb-6 border-4 border-gray-700">
                <Building2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-gray-200 mb-2 tracking-wide">Post a space</h2>
              <p className="text-gray-400 mb-8 max-w-sm">
                List your flex property, warehouse, or office space for businesses to discover.
              </p>
              
              <Link href="/dashboard/owner" className="mt-auto w-full">
                <button className="neu-button w-full py-4 text-lg font-bold tracking-wider uppercase text-gray-300 active:text-emerald-400">
                  Enter as Owner
                </button>
              </Link>
            </div>
          </div>

          {/* RENT SPACE PORTAL */}
          <div className="glass-panel p-2 shadow-2xl transition-transform hover:-translate-y-2 duration-500">
            <div className="skeuo-card p-8 h-full flex flex-col items-center text-center relative overflow-hidden border border-gray-700">
              {/* Metallic Screws (Skeuo Detail) */}
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600 rotate-12"></div></div>
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600 -rotate-12"></div></div>
              <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600 rotate-[60deg]"></div></div>
              <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gray-400 shadow-inner border border-gray-600 flex items-center justify-center"><div className="w-[1px] h-full bg-gray-600 rotate-45"></div></div>

              <div className="w-20 h-20 rounded-full bg-gray-800 shadow-inner flex items-center justify-center mb-6 border-4 border-gray-700">
                <svg className="w-10 h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-gray-200 mb-2 tracking-wide">Rent a space</h2>
              <p className="text-gray-400 mb-8 max-w-sm">
                Find the perfect warehouse, retail, or creative office space with zero hidden fees.
              </p>
              
              <Link href="/dashboard/tenant" className="mt-auto w-full">
                <button className="neu-button w-full py-4 text-lg font-bold tracking-wider uppercase text-gray-300 active:text-amber-400">
                  Enter as Tenant
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Property Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Properties</h2>
            <p className="text-gray-400">Explore prime commercial real estate available right now.</p>
          </div>
          <Link href="/search" className="text-[#a1ebd6] hover:text-white font-medium transition-colors hidden sm:block">
            View All Properties →
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="glass-panel p-16 text-center mt-4">
            <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No properties listed yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Be the first to list a space on Occupyo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/search" className="neu-button px-6 py-3 inline-block">
            View All Properties
          </Link>
        </div>
      </div>

      {/* 4. Trust Signals & Testimonials */}
      <div className="bg-[#0b0f19] border-t border-white/5 py-12">
        <TrustSignals />
        <Testimonials />
      </div>
    </div>
  );
}
