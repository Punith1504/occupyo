"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          {error.message || "An unexpected error caused this page to crash. We've logged the issue and are looking into it."}
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>
          
          <Link 
            href="/"
            className="w-full flex items-center justify-center py-3 rounded-full font-semibold text-white/70 border border-white/10 hover:bg-white/5 hover:text-white transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
