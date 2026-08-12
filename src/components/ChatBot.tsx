"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { hapticTap, hapticMedium } from "@/lib/haptics";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: "bot" | "user", text: string}[]>([
    { sender: "bot", text: "Hi there! 👋 Welcome to Occupyo. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    hapticMedium();
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      let botResponse = "I'm still learning! For detailed inquiries, please contact our support team.";
      const lowerInput = userMsg.toLowerCase();

      if (lowerInput.includes("what is") && lowerInput.includes("occupyo")) {
        botResponse = "Occupyo is a premium B2B marketplace for flexible commercial real estate. We connect property owners with tenants looking for short or long-term warehouse, flex, or office spaces.";
      } else if (lowerInput.includes("how to list") || lowerInput.includes("add property") || lowerInput.includes("post")) {
        botResponse = "To list a property, simply create an Owner account, navigate to your Dashboard, and click 'Add Property'. You can upload HQ photos and set your lease terms instantly.";
      } else if (lowerInput.includes("fee") || lowerInput.includes("cost") || lowerInput.includes("price")) {
        botResponse = "Listing a property is free! We take a small service fee only when a lease is successfully booked through our secure Stripe checkout.";
      } else if (lowerInput.includes("payment") || lowerInput.includes("pay")) {
        botResponse = "We support seamless global payments! We use Stripe Connect for all transactions to ensure security and speed.";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        botResponse = "Hey! 😊 I'm here to help. Ask me about listing properties, pricing, payments, or anything about Occupyo!";
      }

      setIsTyping(false);
      setMessages(prev => [...prev, { sender: "bot", text: botResponse }]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => {
            hapticMedium();
            setIsOpen(true);
          }}
          onPointerDown={hapticTap}
          className="relative bg-black text-white p-4 rounded-full shadow-[var(--neon-glow)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group border border-gray-100"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full border-2 border-[#b4e6ff]/30 animate-[pulseRing_2s_ease-out_infinite]" />
          <MessageSquare className="w-6 h-6 group-hover:text-[var(--accent)] transition-colors relative z-10" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="liquid-glass w-80 sm:w-96 !rounded-2xl shadow-[var(--neon-glow-strong)] overflow-hidden flex flex-col animate-elasticBounce !p-0">
          {/* Header */}
          <div className="bg-black/80 backdrop-blur-xl text-white p-4 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#b4e6ff]/30 to-[#cbb4ff]/30 flex items-center justify-center border border-gray-200">
                  <Sparkles className="w-4 h-4 text-sky-700" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--success)] rounded-full border-2 border-black"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Occupyo AI</h3>
                <p className="text-[10px] text-gray-400">Always online</p>
              </div>
            </div>
            <button 
              onClick={() => {
                hapticTap();
                setIsOpen(false);
              }} 
              onPointerDown={hapticTap}
              className="text-gray-400 hover:text-gray-900 active:scale-90 transition-all p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-80 overflow-y-auto flex flex-col gap-3 bg-[var(--background)]">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                style={{ 
                  animation: `staggerFadeUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${Math.min(idx * 0.05, 0.3)}s both` 
                }}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium transition-all ${
                  msg.sender === "user" 
                    ? "bg-gradient-to-br from-[#b4e6ff] to-[#9dd8ff] text-black rounded-br-sm shadow-md" 
                    : "bg-white/8 backdrop-blur-md text-white/90 rounded-bl-sm border border-gray-100"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white/8 backdrop-blur-md rounded-2xl rounded-bl-sm border border-gray-100">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-black/40 backdrop-blur-xl border-t border-gray-100">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-white/8 backdrop-blur-md rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-white/30 border border-gray-100 focus:border-[#b4e6ff]/40 focus:bg-gray-100 outline-none transition-all"
              />
              <button 
                type="submit"
                onPointerDown={hapticTap}
                disabled={!input.trim()}
                className="bg-gradient-to-br from-[#b4e6ff] to-[#9dd8ff] text-black p-2.5 rounded-xl hover:shadow-[var(--neon-glow)] active:scale-90 transition-all disabled:opacity-30 disabled:hover:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
