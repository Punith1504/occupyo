import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Building2, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BookingForm } from "./BookingForm";
import { PricingBreakdown } from "@/components/property/PricingBreakdown";

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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header / Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">Occupyo</Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black">Dashboard</Link>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                  {property.propertyType}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${property.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {property.status}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 break-words">{property.title}</h1>
              <div className="flex items-center text-gray-500 gap-2 text-lg">
                <MapPin className="h-5 w-5 shrink-0" />
                <span className="break-words">{property.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-200">
              <div>
                <p className="text-gray-500 text-sm mb-1">Size</p>
                <p className="font-semibold text-xl text-gray-900">{property.sizeSqft.toLocaleString()} sqft</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Price</p>
                <p className="font-semibold text-xl text-gray-900">${property.pricePerMonth.toLocaleString()}/mo</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Cap Rate</p>
                <p className="font-semibold text-xl text-gray-900">{property.capRate ? `${property.capRate}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">NOI</p>
                <p className="font-semibold text-xl text-gray-900">{property.noi ? `$${property.noi.toLocaleString()}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Lease Type</p>
                <p className="font-semibold text-xl text-gray-900">{property.leaseType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Duration</p>
                <p className="font-semibold text-xl text-gray-900">{property.minDuration}-{property.maxDuration} {property.durationUnit.toLowerCase()}</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About this space</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg break-words">
                {property.description}
              </p>
            </div>

            {amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-black" />
                      <span className="font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {property.suites && property.suites.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Suites</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.suites.map(suite => (
                    <div key={suite.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm flex justify-between items-center hover:border-black transition-colors cursor-pointer">
                      <div>
                        <h4 className="font-bold text-gray-900">{suite.title}</h4>
                        <p className="text-sm text-gray-500">{suite.sizeSqft.toLocaleString()} sqft</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${suite.pricePerMonth.toLocaleString()}/mo</p>
                        <span className="text-[10px] font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full uppercase tracking-wider">{suite.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <PricingBreakdown baseRent={property.pricePerMonth} />
            
            <div>
               <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location</h2>
               <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative bg-gray-100">
                 <iframe 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0 }} 
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
