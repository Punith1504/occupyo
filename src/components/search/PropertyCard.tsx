import Link from "next/link";
import { Building2, MapPin, CheckCircle2 } from "lucide-react";
import { PropertyType } from "@prisma/client";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    address: string;
    description?: string;
    propertyType: PropertyType | string;
    sizeSqft: number;
    pricePerMonth: number;
    images?: { url: string }[];
    distance?: number;
  };
  variant?: 'home' | 'search';
  isHorizontal?: boolean;
}

export function PropertyCard({ property, variant = 'search', isHorizontal = false }: PropertyCardProps) {
  const isHome = variant === 'home';
  const isHelloCard = property.title.toLowerCase().includes("hello");

  if (isHome) {
    return (
      <Link href={`/property/${property.id}`} className="group block h-full">
        <div className={`bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 rounded-3xl overflow-hidden h-full flex ${isHorizontal ? 'flex-col md:flex-row' : 'flex-col'}`}>
          
          <div className={`${isHorizontal ? 'md:w-2/5 h-56 md:h-auto' : 'h-56'} bg-gray-50 relative overflow-hidden flex-shrink-0 border-b md:border-b-0 ${isHorizontal ? 'md:border-r border-gray-100' : ''}`}>
            {property.images && property.images.length > 0 && property.images[0].url ? (
              <img 
                src={getOptimizedImageUrl(property.images[0].url, { width: 600, height: 400 })} 
                alt={property.title}
                className={`w-full h-full ${isHelloCard ? 'object-contain p-6' : 'object-cover'} transition-transform duration-700 group-hover:scale-105 opacity-90`} 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                <Building2 className="h-20 w-20" />
              </div>
            )}
            
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider text-teal-600 shadow-sm border border-gray-200">
              {property.propertyType}
            </div>
          </div>
          
          <div className={`p-6 md:p-8 flex-1 flex flex-col bg-white min-w-0`}>
            <h3 className="font-bold text-gray-900 text-lg md:text-xl group-hover:text-teal-600 transition-colors truncate">
              {property.title}
            </h3>
            
            <p className="text-xs md:text-sm text-gray-500 mt-2 flex items-start gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 shrink-0 mt-0.5" />
              <span className="truncate">{property.address}</span>
            </p>

            {isHorizontal && property.description && (
              <div className="mt-4 text-gray-600 text-sm line-clamp-3 leading-relaxed flex-1">
                {property.description}
              </div>
            )}
            
            <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100">
              <div>
                <p className="text-gray-900 font-bold text-xl">${property.pricePerMonth.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-900 font-bold text-xl">{property.sizeSqft.toLocaleString()}<span className="text-sm font-normal text-gray-500"> sqft</span></p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Search Variant (also light theme)
  return (
    <Link href={`/property/${property.id}`} className="group block h-full">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-full flex flex-col">
        
        <div className="h-48 bg-gray-50 relative overflow-hidden flex-shrink-0">
          {property.images && property.images.length > 0 && property.images[0].url ? (
            <img 
              src={getOptimizedImageUrl(property.images[0].url, { width: 400, height: 300 })} 
              alt={property.title}
              className={`w-full h-full ${isHelloCard ? 'object-contain p-6' : 'object-cover'} transition-transform duration-700 group-hover:scale-105`} 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-200">
              <Building2 className="h-16 w-16 opacity-50" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-gray-200 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-teal-600 shadow-sm">
            {property.propertyType}
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col bg-white">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-600 transition-colors truncate">
            {property.title}
          </h3>
          
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 mt-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="truncate">{property.address}</span>
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100">
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex flex-col justify-center items-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Size</p>
              <p className="font-mono text-gray-900 text-sm font-semibold w-full text-center">
                {property.sizeSqft.toLocaleString()}
              </p>
            </div>
            <div className="bg-teal-50/50 border border-teal-100 p-3 rounded-lg flex flex-col justify-center items-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Price/mo</p>
              <p className="font-mono text-teal-700 text-sm font-semibold w-full text-center">
                ${property.pricePerMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
