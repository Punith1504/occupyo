import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Building2, Search, ArrowRight } from 'lucide-react';

type Props = {
  params: Promise<{ city: string; neighborhood: string }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const city = p.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const neighborhood = p.neighborhood.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Commercial Space for Rent in ${neighborhood}, ${city} | Occupyo`,
    description: `Find premium commercial real estate, flex offices, and warehouse spaces in ${neighborhood}, ${city}. Transparent pricing, instant booking.`,
  };
}

export default async function LocationPage({ params }: Props) {
  const p = await params;
  const city = p.city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const neighborhood = p.neighborhood.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // JSON-LD Schema for LocalBusiness and RealEstateListing
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": `Commercial Space in ${neighborhood}, ${city}`,
        "description": `Browse premium commercial real estate listings in ${neighborhood}, ${city}.`
      },
      {
        "@type": "LocalBusiness",
        "name": `Occupyo ${city}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city,
          "addressRegion": city,
          "addressCountry": "US"
        },
        "description": "Premium commercial real estate marketplace."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">Occupyo</Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-black text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 mb-6 font-medium">
            <MapPin className="w-5 h-5" />
            <span>{neighborhood}, {city}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Premium Commercial Space in {neighborhood}
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mb-10">
            Discover friction-free commercial real estate. From modern co-working hubs to expansive warehouses, find your perfect space in {neighborhood}.
          </p>
          
          {/* Mock Search Bar */}
          <div className="flex max-w-2xl bg-white rounded-full p-2 items-center">
             <div className="flex-1 px-4 flex items-center gap-3">
               <Search className="w-5 h-5 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by size, type, or budget..." 
                 className="w-full bg-transparent border-none focus:outline-none text-black placeholder-gray-400"
               />
             </div>
             <Link 
               href="/dashboard/tenant"
               className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
             >
               Search Spaces
             </Link>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
           <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
               <Building2 className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-3">Curated Listings</h3>
             <p className="text-gray-600">Only the highest quality commercial spaces in {neighborhood} make it to our platform.</p>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
             <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
               <MapPin className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-3">Prime Locations</h3>
             <p className="text-gray-600">Access exclusive inventory in the most sought-after commercial districts of {city}.</p>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
               <ArrowRight className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Booking</h3>
             <p className="text-gray-600">Bypass months of negotiation. Secure your space with transparent, upfront pricing.</p>
           </div>
        </div>
      </div>
      
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
