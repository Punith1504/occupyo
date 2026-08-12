import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Building2, Filter } from "lucide-react";
import { Suspense } from "react";
import LocationSearchInput from "./LocationSearchInput";
import { DiscoveryMap } from "@/components/dashboard/DiscoveryMap";
import { PropertyCard } from "@/components/search/PropertyCard";
import ErrorBoundary from "@/components/ErrorBoundary";

export const dynamic = "force-dynamic";

export default async function PropertySearchPage(props: {
  searchParams: Promise<{ type?: string; location?: string; lat?: string; lng?: string; niche?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { type, location, lat, lng, niche } = searchParams;
  const userLat = lat ? parseFloat(lat) : null;
  const userLng = lng ? parseFloat(lng) : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    status: "AVAILABLE",
  };

  if (type && type !== "ALL") {
    whereClause.propertyType = type;
  }
  
  // Note: Prisma 'contains' search is basic for MVP. 
  // In a real app, use PostGIS or full-text search.
  if (location && location !== "Current Location" && !userLat) {
    whereClause.address = {
      contains: location,
      mode: "insensitive",
    };
  }

  // Basic implementation of niche filtering using amenities JSON field or title description
  // In a robust implementation this would use a dedicated 'tags' field or PostGIS
  if (niche) {
    whereClause.OR = [
      { title: { contains: niche, mode: "insensitive" } },
      { description: { contains: niche, mode: "insensitive" } },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let properties: any[] = [];
  try {
    properties = await prisma.property.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { companyName: true }
        },
        images: {
          orderBy: { isHero: 'desc' },
          take: 1
        }
      }
    });

    if (userLat !== null && userLng !== null) {
      function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 3958.8; // Radius of the earth in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;  
        const dLon = (lon2 - lon1) * Math.PI / 180; 
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; 
      }

      properties = properties.map(p => {
        const distance = (p.lat !== null && p.lng !== null) 
          ? getDistance(userLat, userLng, p.lat, p.lng) 
          : Infinity;
        return { ...p, distance };
      }).sort((a, b) => a.distance - b.distance);
    }
  } catch (error) {
    console.error("Database connection failed during search:", error);
  }

  return (
    <div className="h-screen bg-transparent flex flex-col font-sans overflow-hidden">
      {/* Search Header - Glassmorphic */}
      <div className="glass-panel mx-4 mt-4 px-8 py-6 z-10 shrink-0 bg-white/60 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Space</h1>
        
        {/* Simple Search Form - Neumorphic inputs */}
        <form className="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="flex-1 relative">
            <LocationSearchInput />
          </div>
          
          <div className="w-full md:w-64 relative">
             <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
             <select 
               name="type"
               defaultValue={type || "ALL"}
               className="neu-input w-full pl-10 pr-4 py-3 appearance-none cursor-pointer min-h-[44px]"
             >
               <option value="ALL">All Property Types</option>
               <option value="WAREHOUSE">Warehouse</option>
               <option value="FLEX">Flex Industrial</option>
               <option value="OFFICE">Office</option>
             </select>
          </div>
          
          <button type="submit" className="px-6 py-3 font-medium flex items-center justify-center gap-2 shrink-0 min-h-[44px] bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
        
        {/* Niche Filtering Tags */}
        <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-sm font-medium text-gray-400 whitespace-nowrap mr-2">Popular Niches:</span>
          {['Premium Co-working', 'Medical', 'Industrial', 'Creative Studio', 'Retail Pop-up'].map(tag => (
            <Link 
              key={tag}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={`/search?${new URLSearchParams({...searchParams as any, niche: tag}).toString()}`}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] flex items-center ${niche === tag ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {tag}
            </Link>
          ))}
          {niche && (
            <Link 
              href={`/search`}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium text-[#ff5b7b] border border-[#ff5b7b]/30 bg-[#ff5b7b]/10 hover:bg-[#ff5b7b]/20 transition-colors ml-2"
            >
              Clear Filter
            </Link>
          )}
        </div>
      </div>

      {/* Main Content: Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
        {/* Left: Scrollable Results */}
        <div className="w-full md:w-[60%] lg:w-[45%] flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
          <div className="flex justify-between items-center mb-6 px-2">
            <p className="text-gray-400 font-medium text-sm">
              Showing <span className="text-gray-900 font-semibold">{properties.length}</span> properties
            </p>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>

        {properties.length === 0 ? (
          <div className="glass-panel p-16 text-center mt-4 mx-2">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
              We couldn't find any spaces matching your criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <ErrorBoundary>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-12">
              {properties.map(property => (
                <PropertyCard key={property.id} property={property as any} />
              ))}
            </div>
          </ErrorBoundary>
        )}
        </div>
        
        {/* Right: Interactive Discovery Map */}
        <div className="hidden md:block w-[40%] lg:w-[55%] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-gray-200 sticky top-0">
          <DiscoveryMap initialProperties={properties} />
        </div>
      </div>
    </div>
  );
}
