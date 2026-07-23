import Link from "next/link";
import { Building2, MapPin, CheckCircle2 } from "lucide-react";
import { PropertyType } from "@prisma/client";

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
        <div className={`liquid-glass border-white/10 hover:border-white/30 h-full flex ${isHorizontal ? 'flex-col md:flex-row' : 'flex-col'}`}>
          
          <div className={`${isHorizontal ? 'md:w-[45%] h-64 md:h-full' : 'h-64'} bg-black/40 relative overflow-hidden flex-shrink-0 border-b md:border-b-0 ${isHorizontal ? 'md:border-r' : ''} border-white/10`}>
            {property.images && property.images.length > 0 && property.images[0].url ? (
              <img 
                src={property.images[0].url} 
                alt=""
                className={`w-full h-full ${isHelloCard ? 'object-contain p-8' : 'object-cover'} transition-transform duration-700 group-hover:scale-105 opacity-90 mix-blend-lighten`} 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/10">
                <Building2 className="h-20 w-20" />
              </div>
            )}
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-[#a1ebd6] shadow-sm border border-white/10">
              {property.propertyType}
            </div>
          </div>
          
          <div className={`p-5 md:p-8 flex-1 flex flex-col bg-white/5`}>
            <h3 className="font-bold text-white text-lg md:text-xl group-hover:text-[#a1ebd6] transition-colors line-clamp-1 drop-shadow-md">
              {property.title}
            </h3>
            
            <p className="text-xs md:text-sm text-gray-400 mt-2 flex items-start gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 shrink-0 mt-0.5" />
              <span className="line-clamp-1 truncate">{property.address}</span>
            </p>

            {isHorizontal && property.description && (
              <p className="mt-4 text-gray-300 text-sm line-clamp-3 leading-relaxed">
                {property.description}
              </p>
            )}
            
            <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/10">
              <div>
                <p className="text-white font-bold text-xl">${property.pricePerMonth.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">{property.sizeSqft.toLocaleString()}<span className="text-sm font-normal text-gray-400"> sqft</span></p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Original Dark / Search Variant
  return (
    <Link href={`/property/${property.id}`} className="group block h-full">
      <div className="glass-panel overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] h-full flex flex-col relative z-10">
        
        <div className="h-48 bg-[#0f172a] relative overflow-hidden flex-shrink-0">
          {property.images && property.images.length > 0 && property.images[0].url ? (
            <img 
              src={property.images[0].url} 
              alt=""
              className={`w-full h-full ${isHelloCard ? 'object-contain p-6' : 'object-cover opacity-80 mix-blend-lighten'} transition-transform duration-700 group-hover:scale-105`} 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10">
              <Building2 className="h-16 w-16 opacity-30" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-200 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.2),_2px_2px_5px_rgba(0,0,0,0.5)]">
            {property.propertyType}
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col bg-[#0b0f19]/80 backdrop-blur-xl border-t border-white/5">
          <h3 className="font-bold text-white text-lg group-hover:text-[#a1ebd6] transition-colors line-clamp-1 drop-shadow-md">
            {property.title}
          </h3>
          
          <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 mt-1">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span className="truncate">{property.address}</span>
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/5">
            <div className="skeuo-card p-3 flex flex-col justify-center items-center">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Size</p>
              <p className="skeuo-led-amber px-2 py-0.5 rounded text-sm w-full text-center">
                {property.sizeSqft.toLocaleString()}
              </p>
            </div>
            <div className="skeuo-card p-3 flex flex-col justify-center items-center">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Price/mo</p>
              <p className="skeuo-led-emerald px-2 py-0.5 rounded text-sm w-full text-center">
                ${property.pricePerMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
