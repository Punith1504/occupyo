"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Sparkles, MapPin } from "lucide-react";
import { hapticTap, hapticMedium } from "@/lib/haptics";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  const router = useRouter();
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    // Open curtain almost immediately for a snappy feel
    const t1 = setTimeout(() => {
      setCurtainOpen(true);
      setContentVisible(true);
    }, 100);
    
    // Remove curtain from DOM after animation
    const t2 = setTimeout(() => setCurtainGone(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">

      {/* ===== ULTRA-TRANSPARENT LIQUID GLASS CURTAIN ===== */}
      {!curtainGone && (
        <>
          {/* Left Curtain */}
          <div
            className="fixed inset-y-0 left-0 z-[100] flex items-center justify-end pr-2"
            style={{
              width: "50.5vw",
              transform: curtainOpen ? "translateX(-100%)" : "translateX(0)",
              transition: "transform 1s cubic-bezier(0.85, 0, 0.15, 1)",
              background: "rgba(255, 255, 255, 0.02)", // 98% transparent
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="absolute inset-0" style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 50%, transparent)",
              animation: "shimmer 1.5s infinite"
            }} />
            <span className="text-6xl md:text-8xl font-black text-white/90 tracking-tight select-none z-10">Occ</span>
          </div>

          {/* Right Curtain */}
          <div
            className="fixed inset-y-0 right-0 z-[100] flex items-center justify-start pl-2"
            style={{
              width: "50.5vw",
              transform: curtainOpen ? "translateX(100%)" : "translateX(0)",
              transition: "transform 1s cubic-bezier(0.85, 0, 0.15, 1)",
              background: "rgba(255, 255, 255, 0.02)", // 98% transparent
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="absolute inset-0" style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 50%, transparent)",
              animation: "shimmer 1.5s infinite",
              animationDelay: "0.2s"
            }} />
            <span className="text-6xl md:text-8xl font-black text-white/90 tracking-tight select-none z-10">upyo</span>
          </div>

          {/* Glowing seam */}
          <div
            className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 z-[101] w-[1px]"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.8), transparent)",
              boxShadow: "0 0 20px rgba(255,255,255,0.5)",
              opacity: curtainOpen ? 0 : 1,
              transition: "opacity 0.4s ease-out",
            }}
          />
        </>
      )}

      {/* ===== CINEMATIC BACKGROUND ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dynamic mesh gradient with pastel colors */}
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-[#cbb4ff] opacity-15 rounded-full blur-[140px] mix-blend-screen animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-[#a1ebd6] opacity-15 rounded-full blur-[140px] mix-blend-screen animate-float" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-[#b4e6ff] opacity-10 rounded-full blur-[160px] mix-blend-screen animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      {/* ===== CONTENT ===== */}
      <div 
        className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "scale(1)" : "scale(1.05)",
          transition: "opacity 1.2s ease-out 0.2s, transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s"
        }}
      >
        <div className="mb-16 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white/80">Next-Gen CRE Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
            Friction-Free Space
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">
            The intelligent marketplace for commercial real estate. Discover, book, and manage your perfect workspace with transparent pricing and zero hidden fees.
          </p>
        </div>

        {/* The Two Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl">
          
          {/* POST BUTTON */}
          <button
            onClick={() => {
              hapticMedium();
              router.push("/dashboard/owner");
            }}
            onPointerDown={hapticTap}
            onMouseEnter={() => {
              hapticTap();
              setHoveredCard("post");
            }}
            onMouseLeave={() => setHoveredCard(null)}
            className="flex-1 group relative p-1 text-left transition-all duration-300 active:scale-[0.98]"
            style={{
              transform: hoveredCard === "post" ? "translateY(-4px)" : "translateY(0)"
            }}
          >
            <div className="pure-glass h-full p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#cbb4ff]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-[#cbb4ff]/20">
                <Building2 className="w-7 h-7 text-[#cbb4ff]" />
              </div>
              
              <h2 className="text-3xl font-semibold text-white mb-2">Post a space</h2>
              <p className="text-white/50 mb-8">List your flex property for businesses to find.</p>
              
              <div className="flex items-center text-[#cbb4ff] font-medium">
                Enter as Owner <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </button>

          {/* RENT BUTTON */}
          <button
            onClick={() => {
              hapticMedium();
              router.push("/dashboard/tenant");
            }}
            onPointerDown={hapticTap}
            onMouseEnter={() => {
              hapticTap();
              setHoveredCard("rent");
            }}
            onMouseLeave={() => setHoveredCard(null)}
            className="flex-1 group relative p-1 text-left transition-all duration-300 active:scale-[0.98]"
            style={{
              transform: hoveredCard === "rent" ? "translateY(-4px)" : "translateY(0)"
            }}
          >
            <div className="pure-glass h-full p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#a1ebd6]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-[#a1ebd6]/20">
                <Search className="w-7 h-7 text-[#a1ebd6]" />
              </div>
              
              <h2 className="text-3xl font-semibold text-white mb-2">Rent a space</h2>
              <p className="text-white/50 mb-8">Find the perfect warehouse or office space.</p>
              
              <div className="flex items-center text-[#a1ebd6] font-medium">
                Enter as Tenant <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </button>

        </div>
      </div>
      
      {/* ===== TRUST SIGNALS & TESTIMONIALS ===== */}
      <div className="relative z-10">
        <TrustSignals />
        <Testimonials />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
