"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SearchResult } from "./SearchResultCard";
import { MapPin } from "lucide-react";

interface SearchMapProps {
  results: SearchResult[];
  highlightedId: string | null;
  onPinClick: (id: string) => void;
}

/**
 * Mapbox GL map panel showing pins for geocoded search results.
 * Only renders pins for internal (non-external) results with lat/lng.
 * Falls back gracefully if mapbox-gl isn't available or API key is missing.
 */
export default function SearchMap({
  results,
  highlightedId,
  onPinClick,
}: SearchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState(false);

  // Filter to results with coordinates
  const geoResults = results.filter(
    (r) => r.lat && r.lng && !r.isExternal
  );

  useEffect(() => {
    if (!mapContainerRef.current || geoResults.length === 0) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!token) {
      setMapError(true);
      return;
    }

    let cancelled = false;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");

        if (cancelled || !mapContainerRef.current) return;

        (mapboxgl as any).accessToken = token;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [geoResults[0].lng!, geoResults[0].lat!],
          zoom: 10,
        });

        mapRef.current = map;

        // Add markers
        geoResults.forEach((result) => {
          const el = document.createElement("div");
          el.className = "search-map-marker";
          el.style.width = "32px";
          el.style.height = "32px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = result.id === highlightedId ? "#6366f1" : "#1e293b";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
          el.style.cursor = "pointer";
          el.style.transition = "all 0.2s ease";
          el.dataset.resultId = result.id;

          el.addEventListener("click", () => onPinClick(result.id));

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([result.lng!, result.lat!])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
                `<div style="font-family:system-ui;padding:4px 0">
                  <strong style="font-size:13px">${result.title}</strong>
                  <div style="font-size:11px;color:#64748b;margin-top:2px">${result.address || result.propertyType}</div>
                </div>`
              )
            )
            .addTo(map);

          markersRef.current.push(marker);
        });

        // Fit bounds
        if (geoResults.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          geoResults.forEach((r) => bounds.extend([r.lng!, r.lat!]));
          map.fitBounds(bounds, { padding: 50 });
        }
      } catch (err) {
        console.error("Map initialization failed:", err);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoResults.map((r) => r.id).join(",")]);

  // Update marker colors when highlighted changes
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const el = marker.getElement();
      const id = el.dataset.resultId;
      el.style.backgroundColor = id === highlightedId ? "#6366f1" : "#1e293b";
      el.style.transform = id === highlightedId ? "scale(1.3)" : "scale(1)";
    });
  }, [highlightedId]);

  if (geoResults.length === 0) {
    return (
      <div className="h-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6">
        <MapPin className="w-8 h-8 mb-2" />
        <p className="text-sm font-medium">No geocoded results</p>
        <p className="text-xs text-slate-300 mt-1">
          Map shows verified listings with coordinates
        </p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6">
        <MapPin className="w-8 h-8 mb-2" />
        <p className="text-sm font-medium">Map unavailable</p>
        <p className="text-xs text-slate-300 mt-1">
          Configure NEXT_PUBLIC_MAPBOX_TOKEN to enable
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full rounded-2xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}
