"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MapPin, Building, Sparkles, Navigation2, Users, DollarSign, Layers } from "lucide-react";
import Link from "next/link";
import { PropertyType } from "@prisma/client";
import { getIsochronePolygons } from "@/app/actions/isochrone";
import Map, { Marker, Source, Layer, MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from '@turf/turf';

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

export function DiscoveryMap({ initialProperties, onPropertiesUpdate }: DiscoveryMapProps) {
  const mapRef = useRef<MapRef>(null);
  
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4,
  });

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Geospatial Intelligence State
  const [isochroneProfile, setIsochroneProfile] = useState<'driving' | 'walking' | 'cycling' | null>(null);
  const [showFootTraffic, setShowFootTraffic] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  
  const [isochroneData, setIsochroneData] = useState<any>(null);
  const [largestIsochrone, setLargestIsochrone] = useState<any>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async () => {
    if (!mapRef.current) return;
    setIsSearching(true);
    
    const bounds = mapRef.current.getMap().getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    try {
      const res = await fetch(`/api/properties/search?neLat=${ne.lat}&neLng=${ne.lng}&swLat=${sw.lat}&swLng=${sw.lng}`);
      if (!res.ok) throw new Error("Search failed");
      let data: Property[] = await res.json();

      // STRICT Client-Side Spatial Filtering using Turf.js
      if (largestIsochrone) {
        data = data.filter(p => {
          if (!p.lat || !p.lng) return false;
          const pt = turf.point([p.lng, p.lat]);
          return turf.booleanPointInPolygon(pt, largestIsochrone);
        });
      }

      setProperties(data);
      if (onPropertiesUpdate) onPropertiesUpdate(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }, [onPropertiesUpdate, largestIsochrone]);

  const handleMoveEnd = useCallback(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, 500); 
  }, [performSearch]);

  // Handle Isochrone fetching
  useEffect(() => {
    const fetchAndRenderIsochrone = async () => {
      if (!mapRef.current) return;
      
      setIsochroneData(null);
      setLargestIsochrone(null);

      if (!isochroneProfile) {
        performSearch();
        return;
      }

      setIsSearching(true);
      const center = mapRef.current.getCenter();
      if (!center) return;

      const res = await getIsochronePolygons(center.lng, center.lat, [5, 10, 15], isochroneProfile);
      
      if (res.success && res.geojson) {
        setIsochroneData(res.geojson);

        const largestFeature = res.geojson.features.find((f: any) => f.properties.contour === 15);
        if (largestFeature) {
          setLargestIsochrone(largestFeature);
        }
      }
      setIsSearching(false);
    };

    fetchAndRenderIsochrone();
  }, [isochroneProfile, performSearch]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e1626] rounded-3xl border border-white/10 p-8 text-center">
         <p className="text-white/60">Map loading failed. Please check your Mapbox Access Token.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[var(--glass-border)] shadow-2xl">
      {isSearching && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#0e1626]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/70 text-xs font-medium shadow-lg">
          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing Spatial Data...
        </div>
      )}

      {/* Geospatial Intelligence Control Panel */}
      <div className="absolute top-4 left-4 z-20 bg-[#0e1626]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl w-64 shadow-2xl">
        <div className="flex items-center gap-2 mb-4 text-white">
          <Layers className="w-4 h-4 text-[#a1ebd6]" />
          <h4 className="font-bold text-sm text-white">Geospatial Intel</h4>
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
                  {mode === 'cycling' && <Layers className="w-3 h-3" />}
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

      {/* Mapbox Map */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
      >
        {isochroneData && (
          <Source id="isochrone" type="geojson" data={isochroneData}>
            <Layer
              id="isochrone-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'contour'],
                  5, '#22c55e',
                  10, '#eab308',
                  15, '#ef4444',
                  '#ef4444'
                ],
                'fill-opacity': 0.15
              }}
            />
            <Layer
              id="isochrone-line"
              type="line"
              paint={{
                'line-color': [
                  'match',
                  ['get', 'contour'],
                  5, '#22c55e',
                  10, '#eab308',
                  15, '#ef4444',
                  '#ef4444'
                ],
                'line-width': 2
              }}
            />
          </Source>
        )}

        {properties.map(prop => (
          prop.lat && prop.lng && (
            <Marker
              key={prop.id}
              longitude={prop.lng}
              latitude={prop.lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setHoveredProperty(prop);
              }}
            >
              <div 
                className="w-4 h-4 bg-[#a1ebd6] rounded-full border-2 border-white shadow-lg cursor-pointer"
                onMouseEnter={() => setHoveredProperty(prop)}
                onMouseLeave={() => setHoveredProperty(null)}
              />
            </Marker>
          )
        ))}
      </Map>

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
