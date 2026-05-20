import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, eventType, eventData } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }

    const event = await prisma.userEvent.create({
      data: {
        userId: userId || null,
        eventType,
        eventData: eventData || {},
      },
    });

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Telemetry error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
