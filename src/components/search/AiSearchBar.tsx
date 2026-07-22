"use client";

import { useState, useRef } from "react";
import Script from "next/script";
import { searchSimilarProperties } from "@/app/actions/search";
import Link from "next/link";
import { Search, Loader2, ExternalLink } from "lucide-react";

export default function AiSearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleScriptLoad = () => {
    if (!inputRef.current || !window.google || autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "name"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && (place.formatted_address || place.name)) {
        // Append a dash so the user can easily continue typing natural language
        const locationString = place.formatted_address || place.name;
        setQuery(`${locationString} - `);
        
        // Return focus to input so they can type immediately
        setTimeout(() => inputRef.current?.focus(), 10);
      }
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResults([]);
    setFallbackTriggered(false);

    try {
      const res = await searchSimilarProperties(query);
      if (res.success && res.properties) {
        setResults(res.properties);
        setFallbackTriggered(res.fallbackTriggered || false);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Load Google Maps Places Library */}
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />

      {/* Inject Liquid Glass styling for the Google Places Autocomplete Dropdown */}
      <style dangerouslySetInnerHTML={{__html: `
        .pac-container {
          background-color: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 1rem !important;
          margin-top: 8px !important;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15) !important;
          font-family: inherit !important;
        }
        
        .dark .pac-container, @media (prefers-color-scheme: dark) {
          .pac-container {
            background-color: rgba(0, 0, 0, 0.3) !important;
          }
        }
        
        .pac-item {
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 12px 16px !important;
          cursor: pointer !important;
          color: rgba(0, 0, 0, 0.8) !important;
          transition: background-color 0.2s;
        }
        
        .dark .pac-item, @media (prefers-color-scheme: dark) {
          .pac-item {
            color: rgba(255, 255, 255, 0.9) !important;
          }
        }

        .pac-item:hover, .pac-item-selected {
          background-color: rgba(255, 255, 255, 0.2) !important;
        }

        .pac-item-query {
          color: inherit !important;
          font-size: 16px !important;
          font-weight: 600 !important;
        }
        
        .pac-matched {
          color: #6366f1 !important; /* Indigo */
          font-weight: bold !important;
        }
        
        .pac-icon {
          display: none !important;
        }
      `}} />

      {/* Search Bar - Liquid Glass */}
      <form 
        onSubmit={handleSearch}
        className="relative group flex items-center bg-white/10 backdrop-blur-md border border-white/20 dark:bg-black/20 rounded-full p-2 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] focus-within:ring-2 focus-within:ring-indigo-500/50"
      >
        <div className="pl-4 pr-2 text-gray-500 dark:text-gray-400">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your ideal space (e.g. 'Creative warehouse in Brooklyn under $5k/mo')"
          className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 py-3 px-2 text-lg w-full"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full px-6 py-3 font-medium transition-all shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),0_4px_10px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Discover"}
        </button>
      </form>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Computing semantic matches...</p>
        </div>
      )}

      {/* Fallback Notice */}
      {fallbackTriggered && results.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
          <ExternalLink size={20} className="shrink-0" />
          <p className="text-sm font-medium">
            No exact local matches found. We've sourced external listings matching your criteria.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {results.map((property: any) => {
            const matchPercentage = Math.round((property.similarity || 0) * 100);
            return (
              <Link href={`/properties/${property.id}`} key={property.id} className="block group/card">
                <div className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 shadow-lg">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-indigo-700 bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300">
                          {property.propertyType}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">
                          {property.title}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-1 rounded-lg">
                          {matchPercentage}% Match
                        </span>
                        {property.isExternal && (
                          <span className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-wider">
                            External
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        ${property.pricePerMonth?.toLocaleString()}<span className="text-sm text-gray-500">/mo</span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        {property.sizeSqft?.toLocaleString()} sqft
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {!isLoading && query && results.length === 0 && !fallbackTriggered && (
        <div className="text-center py-12 text-gray-500">
          No matches found for your query. Try a different search.
        </div>
      )}
    </div>
  );
}
