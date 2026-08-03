import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Simply query the database to keep it awake
    await prisma.user.findFirst({
      select: { id: true }
    });
    return NextResponse.json({ status: "alive", time: new Date().toISOString() });
  } catch (error) {
    console.error("Keepalive failed:", error);
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}
