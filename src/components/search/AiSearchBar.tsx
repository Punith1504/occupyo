"use client";

import { useState, useRef, useEffect } from "react";
import { searchSimilarProperties, autocompleteSearch } from "@/app/actions/search";
import { searchByImage } from "@/app/actions/vision-search";
import Link from "next/link";
import { Search, Loader2, ExternalLink, Image as ImageIcon, AlertCircle, MapPin, Sparkles, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AiSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Autocomplete State
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  
  // Main Search Results
  const [results, setResults] = useState<any[]>([]);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced Autocomplete
  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setKeywordSuggestions([]);
        return;
      }
      try {
        setIsSearching(true);
        const res = await autocompleteSearch(query);
        if (res.success) {
          setSuggestions(res.properties);
          setKeywordSuggestions(res.keywords);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const searchQuery = overrideQuery || query;
    if (!searchQuery.trim()) return;

    setShowDropdown(false);
    setIsLoading(true);
    setResults([]);
    setFallbackTriggered(false);
    setError(null);
    setQuery(searchQuery);

    try {
      const res = await searchSimilarProperties(searchQuery);
      if (res.success && res.properties) {
        setResults(res.properties);
        setFallbackTriggered(res.fallbackTriggered || false);
      } else if (!res.success) {
        setError(res.error || "Search couldn't be completed. Please try again.");
      }
    } catch (err) {
      console.error("Search failed", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResults([]);
    setFallbackTriggered(false);
    setError(null);
    setShowDropdown(false);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        try {
          const res = await searchByImage(dataUrl);
          if (res.success && res.properties) {
            setResults(res.properties);
          } else if (!res.success) {
            setError(res.error || "Image search couldn't be completed.");
          }
        } catch (err) {
          console.error("Vision search failed", err);
          setError("An unexpected error occurred with vision search.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to read file", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 relative" ref={dropdownRef}>
      {/* Search Bar - Liquid Glass */}
      <form 
        onSubmit={(e) => handleSearch(e)}
        className="relative z-50 group flex flex-col md:flex-row items-center bg-white/20 backdrop-blur-xl border border-white/40 dark:bg-black/30 rounded-2xl md:rounded-full p-2 md:p-3 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:bg-white/30 focus-within:bg-white/30"
      >
        <div className="flex items-center w-full relative">
          <div className="pl-3 md:pl-5 pr-2 md:pr-3 text-white dark:text-gray-300">
            {isSearching ? (
              <Loader2 size={22} className="w-5 h-5 md:w-6 md:h-6 animate-spin text-[#a1ebd6]" />
            ) : (
              <Search size={22} className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (query.length >= 2) setShowDropdown(true);
            }}
            placeholder="Describe your ideal space (e.g. 'Creative warehouse in Brooklyn')"
            className="flex-1 bg-transparent border-0 border-transparent outline-none focus:outline-none focus:ring-0 focus:border-transparent text-white dark:text-white placeholder-gray-200 dark:placeholder-gray-300 py-3 px-2 text-base md:text-lg w-full drop-shadow-sm font-medium"
          />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 md:p-3 text-white/80 hover:text-white transition-colors drop-shadow-sm"
            title="Search by Image"
          >
            <ImageIcon size={26} className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-full md:w-auto mt-2 md:mt-0 ml-0 md:ml-2 bg-[#a1ebd6] hover:bg-[#b4e6ff] text-[#060608] rounded-xl md:rounded-full px-6 md:px-8 py-3 md:py-3.5 text-base md:text-lg font-extrabold transition-all shadow-[0_4px_15px_rgba(161,235,214,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
        >
          {isLoading ? <Loader2 className="animate-spin text-[#060608]" size={22} /> : "Discover"}
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && (suggestions.length > 0 || keywordSuggestions.length > 0) && (
        <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          
          {keywordSuggestions.length > 0 && (
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400" /> Recommended Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywordSuggestions.map(kw => (
                  <button
                    key={kw}
                    type="button"
                    onClick={(e) => handleSearch(e, kw)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-white/20"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2">
              <h4 className="px-3 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} className="text-[#a1ebd6]" /> Properties Nearby
              </h4>
              {suggestions.map(prop => (
                <Link
                  key={prop.id}
                  href={`/properties/${prop.id}`}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-[#a1ebd6] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-[#a1ebd6] transition-colors">
                      {prop.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">${prop.pricePerMonth?.toLocaleString()}/mo</span>
                      <span>•</span>
                      <span>{prop.address}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-md">
                    {prop.propertyType}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 text-center">
            <button 
              type="button"
              onClick={(e) => handleSearch(e)}
              className="text-sm font-semibold text-indigo-600 dark:text-[#a1ebd6] hover:underline flex items-center justify-center gap-1 w-full"
            >
              <Search size={14} /> Search Web & Local for "{query}"
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Scraping web & computing semantic matches...</p>
        </div>
      )}

      {/* Fallback Notice */}
      {fallbackTriggered && results.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm animate-in fade-in">
          <ExternalLink size={20} className="shrink-0" />
          <p className="text-sm font-medium">
            No exact local matches found. We executed a live web scrape and found these external listings.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-sm mt-4 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">
            {error}
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {results.map((property: any) => {
            const matchPercentage = Math.round((property.similarity || 0) * 100);
            return (
              <Link 
                href={property.isExternal ? (property.sourceUrl || '#') : `/properties/${property.id}`} 
                target={property.isExternal ? "_blank" : undefined}
                key={property.id} 
                className="block group/card"
              >
                <div className="h-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 shadow-lg relative">
                  {property.isExternal && (
                     <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                       <ExternalLink size={12} /> Web Scrape
                     </div>
                  )}
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
      
      {!isLoading && query && results.length === 0 && !fallbackTriggered && !error && (
        <div className="text-center py-12 text-gray-500">
          No matches found for your query. Try a different search.
        </div>
      )}
    </div>
  );
}
