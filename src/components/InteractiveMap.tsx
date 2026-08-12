"use client";

import { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface InteractiveMapProps {
  lat: number | null;
  lng: number | null;
  address?: string;
  zoom?: number;
  className?: string;
}

export default function InteractiveMap({ lat, lng, address, zoom = 14, className = "" }: InteractiveMapProps) {
  const [viewState, setViewState] = useState({
    longitude: lng || -122.4194,
    latitude: lat || 37.7749,
    zoom: lat && lng ? zoom : 4,
  });

  useEffect(() => {
    if (lat && lng) {
      setViewState({
        longitude: lng,
        latitude: lat,
        zoom: zoom
      });
    }
  }, [lat, lng, zoom]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    // Default to a central US coordinate if none provided
    const displayLat = lat || 39.8283;
    const displayLng = lng || -98.5795;
    
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[#0e1626] ${className}`}>
        <iframe 
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'grayscale(100%) invert(90%) hue-rotate(180deg)', pointerEvents: 'none' }} 
          loading="lazy" 
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${displayLng-0.02},${displayLat-0.02},${displayLng+0.02},${displayLat+0.02}&layer=mapnik&marker=${displayLat},${displayLng}`}
        ></iframe>
        {!lat && !lng && (
          <div className="absolute inset-0 bg-[#0e1626]/50 flex items-center justify-center backdrop-blur-[2px]">
            <p className="text-gray-200 text-sm font-medium bg-black/60 px-4 py-2 rounded-xl">Enter an address to place marker</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--glass-border)] ${className}`}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
      >
        {lat && lng && (
          <Marker longitude={lng} latitude={lat} anchor="bottom">
            <div className="w-5 h-5 bg-[#b4e6ff] rounded-full border-2 border-white shadow-[0_0_10px_rgba(180,230,255,0.8)]" />
          </Marker>
        )}
      </Map>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(6,6,8,0.8)]" />
    </div>
  );
}
