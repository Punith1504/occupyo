import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, MapPin, Building2, Filter } from "lucide-react";
import LocationSearchInput from "@/app/search/LocationSearchInput";

export const dynamic = "force-dynamic";

export default async function PublicPropertiesPage(props: {
  searchParams: Promise<{ type?: string; location?: string; lat?: string; lng?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { type, location, lat, lng } = searchParams;
  const userLat = lat ? parseFloat(lat) : null;
  const userLng = lng ? parseFloat(lng) : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    status: "AVAILABLE",
  };

  if (type && type !== "ALL") {
    whereClause.propertyType = type;
  }
  
  if (location && location !== "Current Location" && !userLat) {
    whereClause.address = {
      contains: location,
      mode: "insensitive",
    };
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
        const R = 3958.8; // Radius in miles
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
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Public Navbar Placeholder */}
      <div className="glass-navbar flex items-center justify-between p-4 sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black tracking-tight text-poppy">Occupyo</Link>
        <div className="flex gap-4">
          <Link href="/sign-in" className="glass-button-secondary py-2 px-6 rounded-xl">Sign In</Link>
          <Link href="/sign-up" className="glass-button py-2 px-6 rounded-xl">Get Started</Link>
        </div>
      </div>

      {/* Search Header */}
      <div className="px-8 py-10 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">
          Find Your <span className="neon-text">Perfect Space</span>
        </h1>
        
        <form className="flex flex-col md:flex-row gap-4 glass p-4 rounded-2xl">
          <div className="flex-1 relative">
            <LocationSearchInput />
          </div>
          
          <div className="w-full md:w-64 relative">
             <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
             <select 
               name="type"
               defaultValue={type || "ALL"}
               className="w-full pl-12 pr-4 py-3.5 glass-input outline-none appearance-none font-semibold text-gray-900"
             >
               <option value="ALL">All Property Types</option>
               <option value="WAREHOUSE">Warehouse</option>
               <option value="FLEX">Flex Industrial</option>
               <option value="OFFICE">Office</option>
             </select>
          </div>
          
          <button type="submit" className="glass-button flex items-center justify-center gap-2 px-8">
            <Search className="h-5 w-5" />
            Explore
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="p-8 flex-1 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-500 font-semibold text-lg">
            Showing <span className="text-black font-black">{properties.length}</span> global properties
          </p>
          <button className="flex items-center gap-2 font-bold text-gray-500 hover:text-black transition-colors">
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 max-w-md mx-auto font-medium">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
              We couldn't find any spaces matching your criteria globally. Try adjusting your filters or check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(property => (
              <Link key={property.id} href={`/property/${property.id}`} className="group block h-full">
                <div className="glass-card overflow-hidden h-full flex flex-col relative">
                  {/* Image */}
                  <div className="h-64 bg-gray-100 relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0].url} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                        <Building2 className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-black">
                      {property.propertyType}
                    </div>
                    {property.distance !== undefined && property.distance !== Infinity && (
                      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xl">
                        <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                        {property.distance.toFixed(1)} mi away
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-black text-gray-900 text-xl mb-2 group-hover:text-[var(--accent-hover)] transition-colors line-clamp-1">
                      {property.title}
                    </h3>
                    
                    <p className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{property.address}</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-[var(--separator)]">
                      <div>
                        <p className="text-gray-500 text-xs font-semibold mb-1">Size</p>
                        <p className="font-black text-gray-900">{property.sizeSqft.toLocaleString()} <span className="text-xs text-gray-500 font-medium">sqft</span></p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-semibold mb-1">Price</p>
                        <p className="font-black text-gray-900">${property.pricePerMonth.toLocaleString()} <span className="text-xs text-gray-500 font-medium">/mo</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
