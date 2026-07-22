"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Sparkles } from "lucide-react";
import { hapticTap, hapticMedium } from "@/lib/haptics";
import { TrustSignals } from "@/components/home/TrustSignals";
import { Testimonials } from "@/components/home/Testimonials";
import AiSearchBar from "@/components/search/AiSearchBar";

export default function Home() {
  const router = useRouter();
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setCurtainOpen(true);
      setContentVisible(true);
    }, 100);
    const t2 = setTimeout(() => setCurtainGone(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Parallax mouse tracking for background orbs
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
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
              background: "rgba(255, 255, 255, 0.02)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0" style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
                animation: "specularSweep 2s ease-out forwards"
              }} />
            </div>
            <span className="text-6xl md:text-8xl font-black text-white/90 tracking-tight select-none z-10">Occ</span>
          </div>

          {/* Right Curtain */}
          <div
            className="fixed inset-y-0 right-0 z-[100] flex items-center justify-start pl-2"
            style={{
              width: "50.5vw",
              transform: curtainOpen ? "translateX(100%)" : "translateX(0)",
              transition: "transform 1s cubic-bezier(0.85, 0, 0.15, 1)",
              background: "rgba(255, 255, 255, 0.02)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0" style={{
                background: "linear-gradient(255deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
                animation: "specularSweep 2s ease-out 0.2s forwards"
              }} />
            </div>
            <span className="text-6xl md:text-8xl font-black text-white/90 tracking-tight select-none z-10">upyo</span>
          </div>

          {/* Glowing seam */}
          <div
            className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 z-[101] w-[1px]"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(180,230,255,0.8), transparent)",
              boxShadow: "0 0 30px rgba(180,230,255,0.5)",
              opacity: curtainOpen ? 0 : 1,
              transition: "opacity 0.4s ease-out",
            }}
          />
        </>
      )}

      {/* ===== PARALLAX BACKGROUND ORBS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute w-[40rem] h-[40rem] bg-[#cbb4ff] opacity-15 rounded-full blur-[140px] mix-blend-screen animate-float transition-transform duration-[2000ms] ease-out"
          style={{ 
            top: '25%', left: '25%',
            transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -30}px)` 
          }} 
        />
        <div 
          className="absolute w-[40rem] h-[40rem] bg-[#a1ebd6] opacity-15 rounded-full blur-[140px] mix-blend-screen animate-float transition-transform duration-[2000ms] ease-out" 
          style={{ 
            bottom: '25%', right: '25%', animationDelay: '-4s',
            transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)` 
          }} 
        />
        <div 
          className="absolute w-[50rem] h-[50rem] bg-[#b4e6ff] opacity-10 rounded-full blur-[160px] mix-blend-screen animate-float transition-transform duration-[2000ms] ease-out" 
          style={{ 
            top: '50%', left: '50%', animationDelay: '-2s',
            transform: `translate(calc(-50% + ${(mousePos.x - 0.5) * 15}px), calc(-50% + ${(mousePos.y - 0.5) * 15}px))` 
          }} 
        />
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
          <div 
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 artifact-shimmer"
            style={{ animation: "staggerFadeUp 0.6s ease-out 0.3s both" }}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white/80">Next-Gen CRE Platform</span>
          </div>
          <h1 
            className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4"
            style={{ animation: "staggerFadeUp 0.6s ease-out 0.5s both" }}
          >
            Friction-Free Space
          </h1>
          <p 
            className="text-xl text-white/50 max-w-2xl mx-auto font-medium mb-12"
            style={{ animation: "staggerFadeUp 0.6s ease-out 0.7s both" }}
          >
            The intelligent marketplace for commercial real estate. Discover, book, and manage your perfect workspace with transparent pricing and zero hidden fees.
          </p>

          <div className="w-full relative z-50 mb-12" style={{ animation: "staggerFadeUp 0.6s ease-out 0.8s both" }}>
            <AiSearchBar />
          </div>
        </div>

        {/* The Two Cards */}
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
            className="flex-1 group relative p-1 text-left transition-all duration-500 active:scale-[0.97]"
            style={{
              transform: hoveredCard === "post" ? "translateY(-6px)" : "translateY(0)",
              animation: "staggerFadeUp 0.6s ease-out 0.9s both",
            }}
          >
            <div className="liquid-glass h-full p-8 overflow-hidden relative !rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#cbb4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#cbb4ff]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 border border-[#cbb4ff]/20 relative">
                <Building2 className="w-7 h-7 text-[#cbb4ff]" />
                <span className="absolute inset-0 rounded-2xl border-2 border-[#cbb4ff]/20 opacity-0 group-hover:opacity-100 animate-[pulseRing_2s_ease-out_infinite]" />
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
            className="flex-1 group relative p-1 text-left transition-all duration-500 active:scale-[0.97]"
            style={{
              transform: hoveredCard === "rent" ? "translateY(-6px)" : "translateY(0)",
              animation: "staggerFadeUp 0.6s ease-out 1.1s both",
            }}
          >
            <div className="liquid-glass h-full p-8 overflow-hidden relative !rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#a1ebd6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="w-14 h-14 rounded-2xl bg-[#a1ebd6]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 border border-[#a1ebd6]/20 relative">
                <Search className="w-7 h-7 text-[#a1ebd6]" />
                <span className="absolute inset-0 rounded-2xl border-2 border-[#a1ebd6]/20 opacity-0 group-hover:opacity-100 animate-[pulseRing_2s_ease-out_infinite]" />
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
    </div>
  );
}
