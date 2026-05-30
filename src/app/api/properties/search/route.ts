import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse bounds from query params
    const neLat = searchParams.get('neLat');
    const neLng = searchParams.get('neLng');
    const swLat = searchParams.get('swLat');
    const swLng = searchParams.get('swLng');

    // If bounds are provided, do a geospatial filter
    if (neLat && neLng && swLat && swLng) {
      const parsedNeLat = parseFloat(neLat);
      const parsedNeLng = parseFloat(neLng);
      const parsedSwLat = parseFloat(swLat);
      const parsedSwLng = parseFloat(swLng);

      if (isNaN(parsedNeLat) || isNaN(parsedNeLng) || isNaN(parsedSwLat) || isNaN(parsedSwLng)) {
        return NextResponse.json({ error: "Invalid coordinate format" }, { status: 400 });
      }

      // Simple bounding box query
      // Handle the edge case where the bounding box crosses the International Date Line
      let lngFilter = {};
      if (parsedNeLng < parsedSwLng) {
        lngFilter = {
          OR: [
            { lng: { gte: parsedSwLng } },
            { lng: { lte: parsedNeLng } }
          ]
        };
      } else {
        lngFilter = {
          lng: {
            gte: parsedSwLng,
            lte: parsedNeLng
          }
        };
      }

      const properties = await prisma.property.findMany({
        where: {
          status: "AVAILABLE",
          lat: {
            gte: parsedSwLat,
            lte: parsedNeLat,
          },
          ...lngFilter,
        },
        include: {
          images: {
            where: { isHero: true },
            take: 1
          }
        },
        take: 50, // Limit to 50 for performance on the map
      });

      return NextResponse.json(properties);
    }

    // If no bounds, return a default set (e.g. latest 20)
    const properties = await prisma.property.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          where: { isHero: true },
          take: 1
        }
      },
      take: 20,
    });

    return NextResponse.json(properties);

  } catch (error) {
    console.error("[PROPERTY_SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
