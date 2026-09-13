"use server";

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL ? new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
}) : null;

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
}) : null;

export async function getIsochronePolygons(
  lng: number, 
  lat: number, 
  contoursMinutes: number[] = [5, 10, 15], 
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (ratelimit) {
      const ip = (await headers()).get("x-forwarded-for") || "anonymous";
      const identifier = userId || ip;
      
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        return { success: false, error: "Too many requests. Please try again later." };
      }
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("Mapbox token missing, cannot fetch isochrones.");
      return { success: false, error: "Mapbox token missing." };
    }

    const contoursStr = contoursMinutes.join(',');
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}?contours_minutes=${contoursStr}&polygons=true&access_token=${token}`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache for 1 hour
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Mapbox API Error:", errorText);
      return { success: false, error: "Failed to fetch isochrones." };
    }

    const geojson = await res.json();
    return { success: true, geojson };
  } catch (error) {
    console.error("Isochrone Server Action Failed:", error);
    return { success: false, error: "Internal server error fetching isochrones." };
  }
}
