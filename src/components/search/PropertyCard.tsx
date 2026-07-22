import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { PropertyType } from "@prisma/client";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    address: string;
    propertyType: PropertyType | string;
    sizeSqft: number;
    pricePerMonth: number;
    images?: { url: string }[];
    distance?: number;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/property/${property.id}`} className="group block">
      <div className="glass-panel overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] h-full flex flex-col relative z-10">
        
        {/* Image Placeholder or Actual Image */}
        <div className="h-48 bg-[#0f172a] relative overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover opacity-80 mix-blend-lighten" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10">
              <Building2 className="h-16 w-16 opacity-30" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] to-transparent pointer-events-none" />

          {/* Skeuomorphic Metallic Badge for Property Type */}
          <div className="absolute top-3 left-3 bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest text-gray-200 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.2),_2px_2px_5px_rgba(0,0,0,0.5)]">
            {property.propertyType}
          </div>
          
          {property.distance !== undefined && property.distance !== Infinity && (
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-[#a1ebd6] px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-[0_4px_10px_rgba(0,0,0,0.4)] border border-white/5">
              <MapPin className="h-3 w-3" />
              {property.distance.toFixed(1)} mi away
            </div>
          )}
        </div>
        
        {/* Content */}
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

          <div className="mt-4 pt-4">
            <div className="neu-button w-full text-center py-2.5 text-sm font-bold flex items-center justify-center gap-2">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
