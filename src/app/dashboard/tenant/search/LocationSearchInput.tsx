"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Autocomplete from "react-google-autocomplete";

export default function LocationSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get("location") || "";
  
  const [query, setQuery] = useState(initialLocation);
  const [isLocating, setIsLocating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handlePlaceSelected = (place: any) => {
    if (place && place.geometry && place.geometry.location) {
      const address = place.formatted_address || place.name;
      setQuery(address);
      
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", place.geometry.location.lat().toString());
      params.set("lng", place.geometry.location.lng().toString());
      params.set("location", address);
      
      router.push(`/dashboard/tenant/search?${params.toString()}`);
    }
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
        <MapPin className="absolute left-3 h-5 w-5 text-gray-400 z-10" />
        <Autocomplete
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          onPlaceSelected={handlePlaceSelected}
          defaultValue={query}
          onChange={(e: any) => setQuery(e.target.value)}
          placeholder="Search by city or address..."
          className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-black outline-none bg-white relative"
          style={{ color: '#000000' }}
        />
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating}
          className="absolute right-3 p-1 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded z-10"
          title="Use my current location"
        >
          <Navigation className={`h-5 w-5 ${isLocating ? 'animate-pulse text-blue-600' : ''}`} />
        </button>
      </div>
    </div>
  );
}
