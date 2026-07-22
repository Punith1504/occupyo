"use server";

export async function getIsochronePolygons(
  lng: number, 
  lat: number, 
  contoursMinutes: number[] = [5, 10, 15], 
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
) {
  try {
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
