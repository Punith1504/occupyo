"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MapPin, Building, Sparkles, Navigation2, Users, DollarSign, Layers } from "lucide-react";
import Link from "next/link";
import { PropertyType } from "@prisma/client";
import { getIsochronePolygons } from "@/app/actions/isochrone";

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

  // Geospatial Intelligence State
  const [isochroneProfile, setIsochroneProfile] = useState<'driving' | 'walking' | 'cycling' | null>(null);
  const [showFootTraffic, setShowFootTraffic] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [activeIsochronePolygon, setActiveIsochronePolygon] = useState<google.maps.Polygon | null>(null);

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (bounds: google.maps.LatLngBounds) => {
    setIsSearching(true);
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    try {
      const res = await fetch(`/api/properties/search?neLat=${ne.lat()}&neLng=${ne.lng()}&swLat=${sw.lat()}&swLng=${sw.lng()}`);
      if (!res.ok) throw new Error("Search failed");
      let data: Property[] = await res.json();

      // STRICT Client-Side Spatial Filtering: Only keep properties INSIDE the Isochrone if active
      if (activeIsochronePolygon && window.google.maps.geometry) {
        data = data.filter(p => {
          if (!p.lat || !p.lng) return false;
          const pt = new window.google.maps.LatLng(p.lat, p.lng);
          return window.google.maps.geometry.poly.containsLocation(pt, activeIsochronePolygon);
        });
      }

      setProperties(data);
      if (onPropertiesUpdate) onPropertiesUpdate(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }, [onPropertiesUpdate, activeIsochronePolygon]);

  const handleBoundsChanged = useCallback(() => {
    if (!mapInstance.current) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      const bounds = mapInstance.current?.getBounds();
      if (bounds) {
        performSearch(bounds);
      }
    }, 500); 
  }, [performSearch]);

  // Map Initialization
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;
      setIsLoaded(true);
  
      const defaultLocation = { lat: 39.8283, lng: -98.5795 }; 
  
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 4,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        backgroundColor: "#0e1626",
      });

      // Data Layer Styling
      mapInstance.current.data.setStyle((feature) => {
        const type = feature.getProperty('type');
        if (type === 'isochrone') {
          const contour = feature.getProperty('contour');
          let color = '#22c55e'; // 5 min
          if (contour === 10) color = '#eab308';
          if (contour === 15) color = '#ef4444';
          
          return {
            fillColor: color,
            strokeColor: color,
            strokeWeight: 2,
            fillOpacity: 0.15,
            zIndex: 10 - contour
          };
        }
        
        if (type === 'foot_traffic') {
          const intensity = feature.getProperty('intensity');
          return {
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: intensity * 5,
              fillColor: '#f97316',
              fillOpacity: 0.4,
              strokeWeight: 0
            }
          };
        }
        
        if (type === 'income') {
          return {
            fillColor: '#8b5cf6',
            strokeColor: '#7c3aed',
            strokeWeight: 1,
            fillOpacity: 0.3
          };
        }

        return {};
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
      // ADDED GEOMETRY LIBRARY FOR SPATIAL FILTERING
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
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

  // Handle Isochrone fetching
  useEffect(() => {
    const fetchAndRenderIsochrone = async () => {
      if (!mapInstance.current) return;
      
      // Clear existing isochrones
      mapInstance.current.data.forEach((feature) => {
        if (feature.getProperty('type') === 'isochrone') {
          mapInstance.current!.data.remove(feature);
        }
      });
      setActiveIsochronePolygon(null);

      if (!isochroneProfile) {
        // Trigger a fresh search to restore all pins
        const bounds = mapInstance.current.getBounds();
        if (bounds) performSearch(bounds);
        return;
      }

      setIsSearching(true);
      const center = mapInstance.current.getCenter();
      if (!center) return;

      const res = await getIsochronePolygons(center.lng(), center.lat(), [5, 10, 15], isochroneProfile);
      
      if (res.success && res.geojson) {
        // Inject custom properties so the styled Data layer catches it
        res.geojson.features.forEach((f: any) => {
          f.properties.type = 'isochrone';
        });
        
        mapInstance.current.data.addGeoJson(res.geojson);

        // Build a Google Maps Polygon from the largest contour (15m) for client-side filtering
        const largestFeature = res.geojson.features.find((f: any) => f.properties.contour === 15);
        if (largestFeature && window.google.maps.geometry) {
          const coords = largestFeature.geometry.coordinates[0].map((c: number[]) => ({ lng: c[0], lat: c[1] }));
          const polygon = new window.google.maps.Polygon({ paths: coords });
          setActiveIsochronePolygon(polygon);
        }
      }
      setIsSearching(false);
    };

    fetchAndRenderIsochrone();
  }, [isochroneProfile, performSearch]);

  // Marker Management
  useEffect(() => {
    if (!mapInstance.current || !window.google) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    properties.forEach(prop => {
      if (prop.lat && prop.lng) {
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
          setHoveredProperty(prop);
        });

        markersRef.current.push(marker);
      }
    });
  }, [properties, isLoaded]);

  // Render
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e1626] rounded-3xl border border-white/10 p-8 text-center">
         <p className="text-white/60">Map loading failed. Please check your API keys.</p>
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
          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing Spatial Data...
        </div>
      )}

      {/* Geospatial Intelligence Control Panel */}
      {isLoaded && (
        <div className="absolute top-4 left-4 z-20 bg-[#0e1626]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl w-64 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-white">
            <Layers className="w-4 h-4 text-[#a1ebd6]" />
            <h4 className="font-bold text-sm">Geospatial Intel</h4>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">Drive-Time Isochrones</p>
              <div className="flex gap-2">
                {(['driving', 'walking', 'cycling'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setIsochroneProfile(isochroneProfile === mode ? null : mode)}
                    className={`flex-1 flex justify-center py-2 rounded-lg border text-xs font-medium transition-colors ${
                      isochroneProfile === mode 
                        ? 'bg-[#a1ebd6] text-[#0e1626] border-[#a1ebd6]' 
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {mode === 'driving' && <Navigation2 className="w-3 h-3" />}
                    {mode === 'walking' && <Users className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">Demographic Overlays</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showFootTraffic}
                    onChange={(e) => setShowFootTraffic(e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-[#a1ebd6] focus:ring-[#a1ebd6]"
                  />
                  Foot Traffic Heatmap
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showIncome}
                    onChange={(e) => setShowIncome(e.target.checked)}
                    className="rounded bg-white/10 border-white/20 text-[#a1ebd6] focus:ring-[#a1ebd6]"
                  />
                  Median Household Income
                </label>
              </div>
            </div>
          </div>
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
          <div className="liquid-glass rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-[#0e1626]/90 backdrop-blur-xl">
            <div className="h-40 bg-white/5 relative">
              {hoveredProperty.images && hoveredProperty.images[0] ? (
                <img src={hoveredProperty.images[0].url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="w-10 h-10 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1626] via-transparent to-transparent" />
            </div>
            <div className="p-4">
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
