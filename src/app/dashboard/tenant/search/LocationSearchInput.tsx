"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LocationSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get("location") || "";
  
  const [query, setQuery] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Get user location on mount for better search suggestions
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {} // silently ignore if permission denied
      );
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 3 || query === initialLocation || query === "Current Location") {
        setSuggestions([]);
        return;
      }
      
      setIsLoadingSuggestions(true);
      try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
        if (userCoords) {
          const v = 0.5;
          url += `&viewbox=${userCoords.lng - v},${userCoords.lat + v},${userCoords.lng + v},${userCoords.lat - v}&bounded=0`;
        }
        
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
          }
        });
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(debounceTimer);
  }, [query, initialLocation]);

  const handleSelectSuggestion = (suggestion: any) => {
    setQuery(suggestion.display_name);
    setShowDropdown(false);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("lat", suggestion.lat);
    params.set("lng", suggestion.lon);
    params.set("location", suggestion.display_name);
    
    router.push(`/dashboard/tenant/search?${params.toString()}`);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        
        setQuery("Current Location");
        setShowDropdown(false);
        
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());
        params.set("location", "Current Location");
        
        router.push(`/dashboard/tenant/search?${params.toString()}`);
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check your browser permissions.");
        console.error(error);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="flex-1 relative flex flex-col" ref={wrapperRef}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 h-5 w-5 text-gray-400" />
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search by city or address..."
          className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating}
          className="absolute right-3 p-1 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          title="Use my current location"
        >
          <Navigation className={`h-5 w-5 ${isLocating ? 'animate-pulse text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (query.length >= 3) && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {isLoadingSuggestions ? (
            <div className="p-4 flex items-center justify-center text-gray-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <Search className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 line-clamp-2 leading-tight">
                      {suggestion.display_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : query !== "Current Location" && query !== initialLocation ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No matching locations found.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
