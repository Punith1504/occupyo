import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Building2, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertySearchPage(props: {
  searchParams: Promise<{ type?: string; location?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    if (process.env.NODE_ENV !== "production") redirect("/sign-in");
  }

  const searchParams = await props.searchParams;
  const { type, location } = searchParams;

  const whereClause: any = {
    status: "AVAILABLE",
  };

  if (type && type !== "ALL") {
    whereClause.propertyType = type;
  }
  
  // Note: Prisma 'contains' search is basic for MVP. 
  // In a real app, use PostGIS or full-text search.
  if (location) {
    whereClause.address = {
      contains: location,
      mode: "insensitive",
    };
  }

  let properties = [];
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
  } catch (error) {
    console.error("Database connection failed during search:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Space</h1>
        
        {/* Simple Search Form */}
        <form className="flex flex-col md:flex-row gap-4 max-w-4xl">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              name="location"
              defaultValue={location || ""}
              placeholder="Search by city or address..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          
          <div className="w-full md:w-64 relative">
             <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
             <select 
               name="type"
               defaultValue={type || "ALL"}
               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white appearance-none"
             >
               <option value="ALL">All Property Types</option>
               <option value="WAREHOUSE">Warehouse</option>
               <option value="FLEX">Flex Industrial</option>
               <option value="OFFICE">Office</option>
             </select>
          </div>
          
          <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="p-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 font-medium">
            Showing <span className="text-black font-semibold">{properties.length}</span> properties
          </p>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any spaces matching your criteria. Try adjusting your filters or post a Space Request to get custom offers from owners.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map(property => (
              <Link key={property.id} href={`/property/${property.id}`} className="group block">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                  {/* Image Placeholder or Actual Image */}
                  <div className="h-56 bg-gray-100 relative">
                    {property.images && property.images.length > 0 ? (
                      <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Building2 className="h-10 w-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide text-gray-800">
                      {property.propertyType}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{property.title}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{property.address}</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-gray-500 text-xs">Size</p>
                        <p className="font-semibold text-gray-900">{property.sizeSqft.toLocaleString()} sqft</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Price</p>
                        <p className="font-semibold text-gray-900">${property.pricePerMonth.toLocaleString()}/mo</p>
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
