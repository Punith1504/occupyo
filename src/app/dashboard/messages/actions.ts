"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import DOMPurify from 'isomorphic-dompurify';
import { pusherServer } from "@/lib/pusher/server";

export async function sendMessage(receiverId: string, content: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const message = await prisma.message.create({
      data: {
        content: DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }),
        senderId: user.id,
        receiverId,
      }
    });

    // For MVP we are using polling, so no need to broadcast via Pusher
    // const channelName = `presence-chat-${[user.id, receiverId].sort().join("-")}`;
    // await pusherServer.trigger(channelName, "new_message", { message });

    return { success: true, messageId: message.id };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getConversations() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: { select: { id: true, companyName: true, role: true, email: true } },
        receiver: { select: { id: true, companyName: true, role: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const partner = msg.senderId === user.id ? msg.receiver : msg.sender;
      if (!conversationsMap.has(partner.id)) {
        conversationsMap.set(partner.id, {
          partner,
          lastMessage: msg,
          unreadCount: msg.receiverId === user.id && !msg.read ? 1 : 0
        });
      } else {
        if (msg.receiverId === user.id && !msg.read) {
          const convo = conversationsMap.get(partner.id);
          convo.unreadCount += 1;
        }
      }
    });

    return { success: true, conversations: Array.from(conversationsMap.values()) };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { success: false, error: "Failed to fetch conversations" };
  }
}

export async function getMessagesWithUser(partnerId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return { success: false, error: "User not found" };

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark received unread messages as read
    const unreadIds = messages
      .filter(m => m.receiverId === user.id && !m.read)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadIds } },
        data: { read: true }
      });
    }

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { id: true, companyName: true, email: true, role: true }
    });

    return { success: true, messages, partner, currentUserId: user.id };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}
