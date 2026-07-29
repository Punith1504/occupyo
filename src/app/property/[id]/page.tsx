import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Building2, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getOptimizedImageUrl } from "@/lib/cloudinary";
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
    <div className="min-h-screen bg-transparent pb-20 font-sans">

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
             <img src={getOptimizedImageUrl(property.images[0].url, { width: 1200, height: 800 })} alt={property.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[500px]">
            <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative cursor-pointer group">
              <img src={getOptimizedImageUrl(property.images[0].url, { width: 1200, height: 800 })} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            {property.images.slice(1, 5).map((img, idx) => (
              <div key={img.id} className="hidden md:block rounded-3xl overflow-hidden relative cursor-pointer group">
                <img src={getOptimizedImageUrl(img.url, { width: 600, height: 400 })} alt={`${property.title} ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
          <div className="flex-1 space-y-8 md:space-y-10 bg-white/60 backdrop-blur-md shadow-sm rounded-3xl p-5 md:p-12 border border-gray-200 relative">
            <div className="flex justify-between items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase shadow-sm border border-teal-100">
                    {property.propertyType}
                  </span>
                  <span className={`px-3 py-1 rounded text-xs font-bold tracking-widest uppercase border shadow-sm ${property.status === "AVAILABLE" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                    {property.status}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 break-words leading-tight">{property.title}</h1>
                <div className="flex items-center text-gray-600 gap-2 text-base md:text-lg font-medium">
                  <MapPin className="h-5 w-5 shrink-0 text-teal-600" />
                  <span>{property.address}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-6 md:py-8 border-y border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Size</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{property.sizeSqft.toLocaleString()} sqft</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">${property.pricePerMonth.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cap Rate</p>
                <p className="text-2xl font-bold text-gray-900">{property.capRate ? `${property.capRate}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">NOI</p>
                <p className="text-2xl font-bold text-gray-900">{property.noi ? `$${property.noi.toLocaleString()}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lease Type</p>
                <p className="text-2xl font-bold text-gray-900">{property.leaseType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration</p>
                <p className="text-2xl font-bold text-gray-900">{property.minDuration}-{property.maxDuration} {property.durationUnit.toLowerCase()}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities & Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                      <span className="text-gray-700 font-medium text-lg">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.suites && property.suites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Suites (Rent Roll)</h2>
                <div className="grid grid-cols-1 gap-2">
                  {property.suites.map(suite => (
                    <div key={suite.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <div>
                        <h4 className="font-bold text-gray-900">{suite.title}</h4>
                        <p className="text-sm text-gray-500">{suite.sizeSqft.toLocaleString()} sqft</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${suite.pricePerMonth.toLocaleString()}/mo</p>
                        <span className="text-[10px] font-mono font-bold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-sm uppercase tracking-widest">{suite.status}</span>
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
