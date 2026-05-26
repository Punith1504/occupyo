"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface InteractiveMapProps {
  lat: number | null;
  lng: number | null;
  address?: string;
  zoom?: number;
  className?: string;
}

// Cinematic Dark Mode Map Style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64779e" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b6878" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334e87" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#021019" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3C7680" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c6675" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#255763" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b0d5ce" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#023e58" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1d2c4d" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry.fill",
    stylers: [{ color: "#283d6a" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#3a4762" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d70" }],
  },
];

export default function InteractiveMap({ lat, lng, address, zoom = 14, className = "" }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // If maps api is already loaded, init right away
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    // Otherwise, it might be loading from PredictiveAddressInput, or we need to load it
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => setLoadError(true);
      document.head.appendChild(script);
    } else {
      // Script is there, just wait for it to execute
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    setIsLoaded(true);

    const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // SF default
    const position = lat && lng ? { lat, lng } : defaultLocation;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: lat && lng ? zoom : 4, // zoom out if no location
      styles: darkMapStyle,
      disableDefaultUI: true, // cleaner look
      zoomControl: true,
      gestureHandling: "cooperative",
      backgroundColor: "#0e1626",
    });

    if (lat && lng) {
      markerInstance.current = new window.google.maps.Marker({
        position,
        map: mapInstance.current,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#b4e6ff", // Pastel Accent
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }
      });
    }
  };

  useEffect(() => {
    // Update map when lat/lng changes
    if (mapInstance.current && lat && lng) {
      const pos = { lat, lng };
      mapInstance.current.panTo(pos);
      mapInstance.current.setZoom(zoom);
      
      if (!markerInstance.current) {
        markerInstance.current = new window.google.maps.Marker({
          position: pos,
          map: mapInstance.current,
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#b4e6ff", 
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }
        });
      } else {
        markerInstance.current.setPosition(pos);
      }
    }
  }, [lat, lng, zoom]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-[#0e1626] border border-[var(--glass-border)] rounded-2xl ${className}`}>
        <p className="text-white/50 text-sm">Failed to load Google Maps.</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--glass-border)] ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0e1626] backdrop-blur-md">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-white/70 text-sm font-medium tracking-wide">Initializing Map Protocol...</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full bg-[#0e1626]" />
      
      {/* Liquid Glass Overlay Effect on Map Edges (Optional but cinematic) */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(6,6,8,0.8)]" />
    </div>
  );
}
