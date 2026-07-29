"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#FAFAF7] font-sans">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-red-100 rounded-3xl p-8 text-center shadow-lg shadow-red-500/5">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Something went wrong</h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {error.message.includes("Can't reach database server") || error.message.includes("PrismaClient")
            ? "Our database is currently waking up from sleep mode (or is temporarily unreachable). Please wait a few seconds and try again."
            : "We encountered an unexpected error while rendering this page."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 bg-teal-600 text-white font-semibold rounded-xl shadow-md hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Try again
          </button>
          
          <Link
            href="/"
            className="w-full py-3.5 px-4 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
