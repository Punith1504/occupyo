import { pusherServer } from "@/lib/pusher/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      return new NextResponse("User not found", { status: 401 });
    }

    // Pusher's default client sends URL encoded form data
    const text = await req.text();
    const params = new URLSearchParams(text);
    const socketId = params.get("socket_id");
    const channel = params.get("channel_name");

    if (!socketId || !channel) {
      return new NextResponse("Missing socketId or channel", { status: 400 });
    }

    const presenceData = {
      user_id: user.id,
      user_info: {
        name: user.companyName || user.email,
        role: user.role,
      },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, presenceData);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
