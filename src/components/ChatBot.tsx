"use client";

import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: "bot" | "user", text: string}[]>([
    { sender: "bot", text: "Hi there! 👋 Welcome to Occupyo. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    // Simulate simple FAQ logic
    setTimeout(() => {
      let botResponse = "I'm still learning! For detailed inquiries, please contact our support team.";
      const lowerInput = userMsg.toLowerCase();

      if (lowerInput.includes("what is") && lowerInput.includes("occupyo")) {
        botResponse = "Occupyo is a premium B2B marketplace for flexible commercial real estate. We connect property owners with tenants looking for short or long-term warehouse, flex, or office spaces.";
      } else if (lowerInput.includes("how to list") || lowerInput.includes("add property") || lowerInput.includes("post")) {
        botResponse = "To list a property, simply create an Owner account, navigate to your Dashboard, and click 'Add Property'. You can upload HQ photos and set your lease terms instantly.";
      } else if (lowerInput.includes("fee") || lowerInput.includes("cost") || lowerInput.includes("price")) {
        botResponse = "Listing a property is free! We take a small service fee only when a lease is successfully booked through our secure Razorpay/Stripe checkout.";
      } else if (lowerInput.includes("payment") || lowerInput.includes("pay")) {
        botResponse = "We support seamless global payments! For Indian transactions, we use Razorpay (UPI, Netbanking, Cards). For international bookings, we use Stripe Connect.";
      }

      setMessages(prev => [...prev, { sender: "bot", text: botResponse }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-black text-white p-4 rounded-full shadow-[var(--neon-glow)] hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6 group-hover:text-[var(--accent)] transition-colors" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-heavy w-80 sm:w-96 rounded-2xl shadow-[var(--neon-glow)] overflow-hidden flex flex-col animate-slideUp border border-[var(--glass-border)]">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse"></div>
              <h3 className="font-bold text-[var(--accent)]">Occupyo Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-80 overflow-y-auto flex flex-col gap-4 bg-[var(--background)]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${
                  msg.sender === "user" 
                    ? "bg-[var(--accent)] text-black rounded-br-sm" 
                    : "glass text-black rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[var(--separator)]">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 glass-input py-2 px-3 text-sm focus:ring-0 border-none"
              />
              <button 
                type="submit"
                className="bg-black text-[var(--accent)] p-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
