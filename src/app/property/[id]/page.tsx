import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Building2, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BookingForm } from "./BookingForm";
import { PricingBreakdown } from "@/components/property/PricingBreakdown";
import CreFinancialCalculator from "@/components/property/CreFinancialCalculator";

export const dynamic = "force-dynamic";

export default async function PropertyPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      owner: {
        select: {
          companyName: true,
          clerkUserId: true,
        }
      },
      images: {
        orderBy: { isHero: 'desc' }
      },
      suites: true
    }
  });

  if (!property) {
    notFound();
  }

  const amenities = property.amenities as string[] || [];

  return (
    <div className="min-h-screen bg-[#0b0f19] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] pb-20 font-sans">
      {/* Header / Nav */}
      <header className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white tracking-tight">Occupyo</Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="neu-button px-4 py-2 text-sm font-medium">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Image Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {property.images.length === 0 ? (
          <div className="h-[400px] md:h-[500px] bg-gray-200 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center">
             <Building2 className="h-20 w-20 text-gray-400 opacity-30 mb-4" />
             <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
               No Images Available
             </div>
          </div>
        ) : property.images.length === 1 ? (
          <div className="h-[400px] md:h-[500px] rounded-3xl overflow-hidden relative">
             <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[500px]">
            <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative cursor-pointer group">
              <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            {property.images.slice(1, 5).map((img, idx) => (
              <div key={img.id} className="hidden md:block rounded-3xl overflow-hidden relative cursor-pointer group">
                <img src={img.url} alt={`${property.title} ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {idx === 3 && property.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] transition-colors group-hover:bg-black/50">
                    <span className="text-white font-semibold text-lg">+{property.images.length - 5} More</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          
          {/* Main Content */}
          <div className="flex-1 space-y-8 md:space-y-10 liquid-glass p-5 md:p-12 border border-white/20 relative">
            <div className="flex justify-between items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white/10 text-[#a1ebd6] px-3 py-1 rounded text-xs font-bold tracking-widest uppercase shadow-sm border border-white/10">
                    {property.propertyType}
                  </span>
                  <span className={`px-3 py-1 rounded text-xs font-bold tracking-widest uppercase border shadow-sm ${property.status === "AVAILABLE" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}`}>
                    {property.status}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 break-words leading-tight drop-shadow-md">{property.title}</h1>
                <div className="flex items-center text-gray-300 gap-2 text-base md:text-lg font-medium">
                  <MapPin className="h-5 w-5 shrink-0 text-[#a1ebd6]" />
                  <span>{property.address}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-6 md:py-8 border-y border-white/10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Size</p>
                <p className="text-xl md:text-2xl font-bold text-white">{property.sizeSqft.toLocaleString()} sqft</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price</p>
                <p className="text-xl md:text-2xl font-bold text-white">${property.pricePerMonth.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cap Rate</p>
                <p className="text-2xl font-bold text-white">{property.capRate ? `${property.capRate}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">NOI</p>
                <p className="text-2xl font-bold text-white">{property.noi ? `$${property.noi.toLocaleString()}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lease Type</p>
                <p className="text-2xl font-bold text-white">{property.leaseType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Duration</p>
                <p className="text-2xl font-bold text-white">{property.minDuration}-{property.maxDuration} {property.durationUnit.toLowerCase()}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-md">Executive Summary</h2>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Amenities & Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#a1ebd6] shrink-0" />
                      <span className="text-gray-300 font-medium text-lg">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.suites && property.suites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Available Suites (Rent Roll)</h2>
                <div className="grid grid-cols-1 gap-2">
                  {property.suites.map(suite => (
                    <div key={suite.id} className="p-4 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                      <div>
                        <h4 className="font-bold text-white">{suite.title}</h4>
                        <p className="text-sm text-gray-300">{suite.sizeSqft.toLocaleString()} sqft</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${suite.pricePerMonth.toLocaleString()}/mo</p>
                        <span className="text-[10px] font-mono font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-sm uppercase tracking-widest">{suite.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <PricingBreakdown baseRent={property.pricePerMonth} />
            
            <CreFinancialCalculator 
              defaultMonthlyRent={property.pricePerMonth}
              defaultCapRate={property.capRate ?? undefined}
              defaultNoi={property.noi ?? undefined}
            />
            
            <div className="mt-10">
               <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2 inline-block">Plat Map / Topography</h2>
               <div className="h-[400px] w-full rounded-sm p-2 bg-gray-200 border-2 border-gray-300 shadow-inner relative">
                 <iframe 
                   width="100%" 
                   height="100%" 
                   style={{ border: '1px solid #9ca3af' }} 
                   loading="lazy" 
                   allowFullScreen 
                   referrerPolicy="no-referrer-when-downgrade" 
                   src={`https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
                 ></iframe>
               </div>
            </div>
          </div>

          {/* Sidebar / CTA */}
           <div className="w-full lg:w-96">
             <BookingForm 
               propertyId={property.id}
               pricePerMonth={property.pricePerMonth}
               minDuration={property.minDuration}
               maxDuration={property.maxDuration}
               durationUnit={property.durationUnit}
               pricePerHour={property.pricePerHour}
               pricePerDay={property.pricePerDay}
               ownerName={property.owner?.companyName || 'Verified Owner'}
               ownerId={property.ownerId}
             />
          </div>

        </div>
      </div>
    </div>
  );
}
