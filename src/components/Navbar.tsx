"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 fluted-glass !rounded-none !border-x-0 !border-t-0 shadow-[0_4px_30px_rgba(0,0,0,0.05)] bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-3 md:py-6 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2 drop-shadow-sm z-50">
            <Building2 className="text-teal-600 h-6 w-6 md:h-8 md:w-8" /> Occupyo
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard/owner" className="px-5 py-3 text-base font-bold text-gray-600 hover:text-gray-900 transition-colors">Post Space</Link>
            <Link href="/dashboard/tenant" className="px-6 py-3 text-base font-bold bg-white/60 border border-gray-200 text-gray-900 rounded-xl hover:bg-white transition-colors backdrop-blur-md shadow-sm">Rent Space</Link>
          </div>

          <button 
            className="md:hidden p-2 -mr-2 text-gray-700 hover:text-gray-900 z-50 relative rounded-lg active:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-3xl transition-all duration-300 ease-in-out md:hidden flex flex-col pt-[88px] px-6 ${
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-4 w-full mt-4">
          <Link 
            href="/dashboard/tenant" 
            className="w-full py-4 text-center text-lg font-bold bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/20 active:scale-95 transition-transform"
          >
            Rent Space
          </Link>
          <Link 
            href="/dashboard/owner" 
            className="w-full py-4 text-center text-lg font-bold bg-white border-2 border-gray-200 text-gray-800 rounded-2xl shadow-sm active:scale-95 transition-transform"
          >
            Post Space
          </Link>
          
          <div className="w-full h-px bg-gray-200 my-6"></div>
          
          <div className="flex flex-col gap-6 px-2">
            <Link href="/search?type=OFFICE" className="text-xl font-semibold text-gray-700 flex items-center justify-between">
              Office Spaces <span className="text-gray-300">&rarr;</span>
            </Link>
            <Link href="/search?type=RETAIL" className="text-xl font-semibold text-gray-700 flex items-center justify-between">
              Retail Spaces <span className="text-gray-300">&rarr;</span>
            </Link>
            <Link href="/search?type=INDUSTRIAL" className="text-xl font-semibold text-gray-700 flex items-center justify-between">
              Industrial Spaces <span className="text-gray-300">&rarr;</span>
            </Link>
            <Link href="/enterprise" className="text-xl font-semibold text-teal-600 flex items-center justify-between mt-2">
              Enterprise Solutions <span className="text-teal-300">&rarr;</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
