"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { hapticTap, hapticMedium } from "@/lib/haptics";

// Debounce hook to prevent API spam
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function LocationSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get("location") || "";
  
  const [query, setQuery] = useState(initialLocation);
  const debouncedQuery = useDebounce(query, 300);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps API seamlessly
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        if (!autocompleteService.current) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        if (!placesService.current) {
          mapDiv.current = document.createElement('div');
          placesService.current = new window.google.maps.places.PlacesService(mapDiv.current);
        }
        return;
      }
      
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        mapDiv.current = document.createElement('div');
        placesService.current = new window.google.maps.places.PlacesService(mapDiv.current);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // Click outside handler for closing the dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch predictive suggestions on debounced keystroke
  useEffect(() => {
    if (!autocompleteService.current || !debouncedQuery.trim() || debouncedQuery === initialLocation) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    autocompleteService.current.getPlacePredictions(
      { input: debouncedQuery }, 
      (results, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowDropdown(true);
        } else {
          setPredictions([]);
        }
      }
    );
  }, [debouncedQuery, initialLocation]);

  // Handle predictive selection and route injection
  const handleSelect = (placeId: string, description: string) => {
    hapticMedium();
    setQuery(description);
    setShowDropdown(false);
    
    if (!placesService.current) return;
    
    placesService.current.getDetails(
      { placeId, fields: ['geometry'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("lat", place.geometry.location.lat().toString());
          params.set("lng", place.geometry.location.lng().toString());
          params.set("location", description);
          // Preserve the context of where the search was executed
          router.push(`${pathname}?${params.toString()}`);
        }
      }
    );
  };

  // Hardware geolocation
  const handleLocate = () => {
    hapticTap();
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        hapticMedium();
        const { latitude, longitude } = position.coords;
        
        setQuery("Current Location");
        setShowDropdown(false);
        
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());
        params.set("location", "Current Location");
        
        router.push(`${pathname}?${params.toString()}`);
      },
      (error) => {
        setIsLocating(false);
        hapticMedium();
        alert("Unable to retrieve your location. Please check your browser permissions.");
        console.error(error);
      },
      { timeout: 10000 }
    );
  };

  // Cognitive load balancing: Bold matched substrings
  const renderHighlightedText = (text: string, matches: google.maps.places.PredictionSubstring[]) => {
    if (!matches || matches.length === 0) return <span>{text}</span>;
    
    const parts = [];
    let lastIndex = 0;
    
    matches.forEach(match => {
      if (match.offset > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.offset)}</span>);
      }
      parts.push(
        <span key={`match-${match.offset}`} className="font-black text-[var(--accent)] tracking-tight">
          {text.substring(match.offset, match.offset + match.length)}
        </span>
      );
      lastIndex = match.offset + match.length;
    });
    
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return <>{parts}</>;
  };

  return (
    <div className="flex-1 relative flex flex-col z-[100]" ref={wrapperRef}>
      <div className="relative flex items-center group">
        <MapPin className="absolute left-4 h-5 w-5 text-gray-400 z-10 transition-colors duration-300 group-focus-within:text-[var(--accent)]" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
             if (predictions.length > 0) setShowDropdown(true);
          }}
          placeholder="Minnesota predictive search..."
          className="w-full pl-12 pr-12 py-3.5 glass-input outline-none appearance-none font-semibold text-gray-900 transition-all duration-300 shadow-sm focus:shadow-[var(--neon-glow)]"
        />

        <div className="absolute right-4 flex items-center gap-2 z-10">
          {isSearching || isLocating ? (
             <Loader2 className="h-5 w-5 text-[var(--accent)] animate-spin" />
          ) : (
            <button
              type="button"
              onClick={handleLocate}
              onPointerDown={hapticTap}
              className="p-1 text-gray-400 hover:text-[var(--accent)] transition-all active:scale-90 outline-none"
              title="Use hardware GPS"
            >
              <Navigation className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Predictive Dropdown Menu (Glassmorphism + Native CSS Transitions) */}
      <div 
        className={`absolute top-[110%] left-0 right-0 glass-heavy rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top border border-[var(--glass-border)] ${
          showDropdown && predictions.length > 0 
            ? 'opacity-100 scale-y-100 translate-y-0' 
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <ul className="max-h-80 overflow-y-auto overscroll-contain">
          {predictions.map((p) => (
            <li 
              key={p.place_id}
              onClick={() => handleSelect(p.place_id, p.description)}
              onPointerDown={hapticTap}
              className="flex items-center gap-4 p-4 border-b border-[var(--separator)] hover:bg-black/5 cursor-pointer transition-colors active:bg-black/10"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center flex-shrink-0 shadow-sm">
                 <MapPin className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 text-sm text-gray-800 truncate leading-tight">
                {renderHighlightedText(p.description, p.matched_substrings)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
