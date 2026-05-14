"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { sendMessage } from "../actions";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
}

export default function ChatInterface({ 
  initialMessages, 
  currentUserId, 
  partnerId 
}: { 
  initialMessages: Message[];
  currentUserId: string;
  partnerId: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      senderId: currentUserId,
      createdAt: new Date()
    };

    setMessages(prev => [...prev, tempMsg]);
    setContent("");
    setSending(true);

    const result = await sendMessage(partnerId, tempMsg.content);
    
    if (result.success) {
      router.refresh(); // Refresh server data
    } else {
      alert("Failed to send message.");
      // Rollback optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
    
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-medium">
            Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                    isMe 
                      ? 'bg-black text-white rounded-br-sm' 
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-black focus:ring-1 focus:ring-black rounded-full px-5 py-3 outline-none transition-all"
            disabled={sending}
          />
          <button 
            type="submit"
            disabled={!content.trim() || sending}
            className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
