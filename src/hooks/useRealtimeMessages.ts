import { useEffect, useState, useRef } from "react";
import { getMessagesWithUser } from "@/app/dashboard/messages/actions";
import { getPusherClient } from "@/lib/pusher/client";

export function useRealtimeMessages(currentUserId: string, partnerId: string, initialMessages: any[]) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [partnerIsOnline, setPartnerIsOnline] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pusherClient = getPusherClient();
  
  useEffect(() => {
    if (!pusherClient) return;

    const channelName = `presence-chat-${[currentUserId, partnerId].sort().join("-")}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new_message", (data: { message: any }) => {
      setMessages((prev) => {
        // Prevent duplicate messages in case polling caught it or strict mode double fired
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    });

    channel.bind("pusher:subscription_succeeded", (members: any) => {
      if (members.members[partnerId]) {
        setPartnerIsOnline(true);
      }
    });

    channel.bind("pusher:member_added", (member: any) => {
      if (member.id === partnerId) {
        setPartnerIsOnline(true);
      }
    });

    channel.bind("pusher:member_removed", (member: any) => {
      if (member.id === partnerId) {
        setPartnerIsOnline(false);
        setPartnerIsTyping(false);
      }
    });

    channel.bind("client-typing", (data: { userId: string, isTyping: boolean }) => {
      if (data.userId === partnerId) {
        setPartnerIsTyping(data.isTyping);
        
        // Auto-clear typing indicator if no new event comes within 3 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => setPartnerIsTyping(false), 3000);
        }
      }
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [currentUserId, partnerId, pusherClient]);

  const sendTypingEvent = (isTyping: boolean = true) => {
    if (!pusherClient) return;
    const channelName = `presence-chat-${[currentUserId, partnerId].sort().join("-")}`;
    const channel = pusherClient.channel(channelName);
    if (channel) {
      channel.trigger("client-typing", { userId: currentUserId, isTyping });
    }
  };

  return {
    messages,
    setMessages,
    partnerIsTyping,
    partnerIsOnline,
    sendTypingEvent
  };
}
