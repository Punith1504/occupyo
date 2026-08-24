import React from 'react';
import Header from '@/components/layout/Header';
import MarketSearch from '@/components/dashboard/MarketSearch';

export default function TenantDiscoveryPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white border-b border-slate-200">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Find your next commercial <br className="hidden md:block"/> space, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">intelligently.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10">
              Stop endlessly filtering through outdated directories. Tell us exactly what you need in natural language, and our AI will instantly match you with verified broker inventory.
            </p>
          </div>
        </div>

        {/* Search App Area */}
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <MarketSearch />
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Occupyo Technologies. Enterprise CRE Intelligence.
        </div>
      </footer>
    </div>
  );
}
