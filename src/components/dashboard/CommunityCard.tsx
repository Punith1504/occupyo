"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check, MessageCircle, ArrowRight } from "lucide-react";

export function CommunityCard() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate a random referral code for the MVP if user doesn't have one loaded
    const randomCode = "OCC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReferralCode(randomCode);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://occupyo.com/invite/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-green-900 to-black rounded-2xl p-8 border border-green-800 shadow-xl relative overflow-hidden text-gray-900 mt-8">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      
      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
        
        {/* Referral Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold uppercase tracking-wider border border-green-500/30">
            <Share2 className="w-3 h-3" /> Growth Engine
          </div>
          <h3 className="text-2xl font-bold">Refer & Earn</h3>
          <p className="text-green-100/70 text-sm">
            Give a business $500 off their first month, and you get $500 in platform credits when they sign a lease.
          </p>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="bg-black/50 border border-green-500/30 px-4 py-3 rounded-lg font-mono text-green-400 flex-1 truncate">
              occupyo.com/invite/{referralCode}
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg transition-colors flex items-center justify-center min-w-[48px]"
              title="Copy Link"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* WhatsApp Community Section */}
        <div className="border-l border-green-800/50 pl-0 md:pl-8 space-y-4 pt-8 md:pt-0 border-t md:border-t-0 mt-8 md:mt-0">
          <div className="w-12 h-12 bg-[#25D366]/20 rounded-full flex items-center justify-center mb-2">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
          </div>
          <h3 className="text-xl font-bold">Join the Alpha Group</h3>
          <p className="text-green-100/70 text-sm mb-4">
            Connect directly with our founders, top landlords, and growing businesses in our private WhatsApp community. Get off-market deals first.
          </p>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); alert("Redirecting to WhatsApp Community..."); }}
            className="inline-flex items-center gap-2 text-[#25D366] font-semibold hover:text-gray-900 transition-colors group"
          >
            Join WhatsApp Group <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </div>
  );
}
