"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MapPin, Building, Sparkles } from "lucide-react";
import Link from "next/link";
import { PropertyType } from "@prisma/client";

interface Property {
  id: string;
  title: string;
  pricePerMonth: number;
  lat: number | null;
  lng: number | null;
  propertyType: PropertyType;
  sizeSqft: number;
  images: { url: string; isHero: boolean }[];
}

interface DiscoveryMapProps {
  initialProperties: Property[];
  onPropertiesUpdate?: (properties: Property[]) => void;
}

const darkMapStyle = [
  // Keeping our cinematic dark style from InteractiveMap
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
];

export function DiscoveryMap({ initialProperties, onPropertiesUpdate }: DiscoveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (bounds: google.maps.LatLngBounds) => {
    setIsSearching(true);
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    try {
      const res = await fetch(`/api/properties/search?neLat=${ne.lat()}&neLng=${ne.lng()}&swLat=${sw.lat()}&swLng=${sw.lng()}`);
      if (!res.ok) throw new Error("Search failed");
      const data: Property[] = await res.json();
      setProperties(data);
      if (onPropertiesUpdate) onPropertiesUpdate(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }, [onPropertiesUpdate]);

  const handleBoundsChanged = useCallback(() => {
    if (!mapInstance.current) return;
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      const bounds = mapInstance.current?.getBounds();
      if (bounds) {
        performSearch(bounds);
      }
    }, 500); // 500ms debounce
  }, [performSearch]);

  // Map Initialization
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;
      setIsLoaded(true);
  
      const defaultLocation = { lat: 39.8283, lng: -98.5795 }; // US center
  
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 4,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        backgroundColor: "#0e1626",
      });

      mapInstance.current.addListener('idle', handleBoundsChanged);
    };

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setLoadError(true);
      return;
    }

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      (window as any).gm_authFailure = () => setLoadError(true);
      script.onload = () => initMap();
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }
  }, [handleBoundsChanged]);

  // Marker Management
  useEffect(() => {
    if (!mapInstance.current || !window.google) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    properties.forEach(prop => {
      if (prop.lat && prop.lng) {
        // Simple default markers since we don't have AdvancedMarkerElement guarantee without the specific library
        // But we can add listeners for hover state
        const marker = new window.google.maps.Marker({
          position: { lat: prop.lat, lng: prop.lng },
          map: mapInstance.current,
          title: prop.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#a1ebd6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }
        });

        marker.addListener("mouseover", () => setHoveredProperty(prop));
        marker.addListener("mouseout", () => setHoveredProperty(null));
        marker.addListener("click", () => {
          // If we had a router, we could push here. But we just show the card.
          setHoveredProperty(prop);
        });

        markersRef.current.push(marker);
      }
    });

  }, [properties, isLoaded]);


  // Fallback UI (Premium Grid View)
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e1626] rounded-3xl border border-white/10 p-8 text-center animate-fadeUp relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-screen" />
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-[#cbb4ff] opacity-10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative z-10 backdrop-blur-md">
          <MapPin className="w-10 h-10 text-[#a1ebd6]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 relative z-10">Geospatial Discovery Disabled</h2>
        <p className="text-white/60 max-w-md mb-8 relative z-10">
          The interactive map engine is currently running in fallback mode due to a missing API configuration. You can still discover premium spaces using our high-fidelity list view.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full relative z-10">
           {/* Fallback Grid items from initial properties */}
           {initialProperties.slice(0, 3).map(prop => (
             <Link key={prop.id} href={`/property/${prop.id}`} className="glass-card p-4 hover:bg-white/10 transition-colors text-left flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0 overflow-hidden">
                  {prop.images[0] ? (
                    <img src={prop.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-8 h-8 m-4 text-white/30" />
                  )}
                </div>
                <div>
                  <h4 className="text-white font-semibold truncate w-32">{prop.title}</h4>
                  <p className="text-[#a1ebd6] font-medium text-sm mt-1">${prop.pricePerMonth}/mo</p>
                </div>
             </Link>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl">
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0e1626] backdrop-blur-xl">
          <Loader2 className="w-10 h-10 text-[#a1ebd6] animate-spin mb-4" />
          <p className="text-[#a1ebd6] text-sm font-semibold tracking-widest uppercase">Initializing Geospatial Engine</p>
        </div>
      )}
      
      {isSearching && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#0e1626]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/70 text-xs font-medium shadow-lg">
          <Loader2 className="w-3 h-3 animate-spin" /> Scanning Area...
        </div>
      )}

      {/* The Map */}
      <div ref={mapRef} className="w-full h-full bg-[#0e1626]" />

      {/* Floating Hover Card */}
      <div 
        className={`absolute top-4 right-4 z-30 w-72 transition-all duration-500 ease-out transform ${
          hoveredProperty ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {hoveredProperty && (
          <div className="liquid-glass rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <div className="h-40 bg-white/5 relative">
              {hoveredProperty.images && hoveredProperty.images[0] ? (
                <img src={hoveredProperty.images[0].url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="w-10 h-10 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1626] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#cbb4ff]" /> Premium
              </div>
            </div>
            <div className="p-4 bg-[#0e1626]/90 backdrop-blur-xl">
              <h3 className="text-white font-bold truncate text-lg">{hoveredProperty.title}</h3>
              <p className="text-white/60 text-xs mb-3 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {hoveredProperty.sizeSqft} sqft {hoveredProperty.propertyType}
              </p>
              
              <div className="flex items-end justify-between mt-2">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">Monthly Lease</p>
                  <p className="text-[#a1ebd6] font-bold text-xl">${hoveredProperty.pricePerMonth.toLocaleString()}</p>
                </div>
                <Link 
                  href={`/property/${hoveredProperty.id}`}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                >
                  View Space
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Edge Shadow overlay for cinematic depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(14,22,38,1)] z-10" />
    </div>
  );
}
