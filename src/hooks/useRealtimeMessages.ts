import { useEffect, useState, useRef } from "react";
import { getPusherClient } from "@/lib/pusher/client";
import type { PresenceChannel } from "pusher-js";

export function useRealtimeMessages(currentUserId: string, partnerId: string, initialMessages: any[]) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [partnerIsOnline, setPartnerIsOnline] = useState(false);
  const [channel, setChannel] = useState<PresenceChannel | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    // Create a unique deterministic channel name for this conversation
    const channelName = `presence-chat-${[currentUserId, partnerId].sort().join("-")}`;
    
    // Subscribe to presence channel
    const presenceChannel = pusher.subscribe(channelName) as PresenceChannel;
    setChannel(presenceChannel);

    // Presence events
    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
      if (members.get(partnerId)) setPartnerIsOnline(true);
    });

    presenceChannel.bind("pusher:member_added", (member: any) => {
      if (member.id === partnerId) setPartnerIsOnline(true);
    });

    presenceChannel.bind("pusher:member_removed", (member: any) => {
      if (member.id === partnerId) {
        setPartnerIsOnline(false);
        setPartnerIsTyping(false);
      }
    });

    // Message events
    presenceChannel.bind("new_message", (data: { message: any }) => {
      // Append the new message only if we don't already have it (prevent duplicates from our own sends if we do optimistic updates)
      setMessages((prev) => {
        if (prev.find(m => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      // If we receive a message, they are likely not typing anymore
      setPartnerIsTyping(false);
    });

    // Typing events (requires client events to be enabled in Pusher dashboard)
    presenceChannel.bind("client-typing", (data: { userId: string }) => {
      if (data.userId === partnerId) {
        setPartnerIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setPartnerIsTyping(false), 3000);
      }
    });

    return () => {
      pusher.unsubscribe(channelName);
      presenceChannel.unbind_all();
    };
  }, [currentUserId, partnerId]);

  const sendTypingEvent = () => {
    if (channel) {
      // Catch error silently in case client events are disabled in dashboard
      try {
        channel.trigger("client-typing", { userId: currentUserId });
      } catch (e) {}
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
