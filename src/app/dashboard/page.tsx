/* eslint-disable react-hooks/purity */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, ArrowRight, Sparkles } from "lucide-react";

export default function DashboardHub() {
  const router = useRouter();
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger curtain opening after a brief pause
    const t1 = setTimeout(() => setCurtainOpen(true), 300);
    // Show content after curtain opens
    const t2 = setTimeout(() => setContentVisible(true), 1000);
    // Stagger card entrance
    const t3 = setTimeout(() => setCardsVisible(true), 1400);
    
    // Setup mouse tracking for parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => { 
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); 
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-black"
    >
      
      {/* Animated Background Orbs with Parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] animate-pulse transition-transform duration-[2000ms] ease-out"
          style={{ 
            background: "radial-gradient(circle, #6366f1, transparent)", 
            top: "-200px", left: "-100px", animationDuration: "4s",
            transform: `translate(${(mousePos.x - 0.5) * -40}px, ${(mousePos.y - 0.5) * -40}px)`
          }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] animate-pulse transition-transform duration-[2000ms] ease-out"
          style={{ 
            background: "radial-gradient(circle, #8b5cf6, transparent)", 
            bottom: "-150px", right: "-100px", animationDuration: "5s", animationDelay: "1s",
            transform: `translate(${(mousePos.x - 0.5) * 30}px, ${(mousePos.y - 0.5) * 30}px)`
          }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] animate-pulse transition-transform duration-[2000ms] ease-out"
          style={{ 
            background: "radial-gradient(circle, #06b6d4, transparent)", 
            top: "40%", left: "50%", animationDuration: "6s", animationDelay: "2s",
            transform: `translate(calc(-50% + ${(mousePos.x - 0.5) * 20}px), calc(-50% + ${(mousePos.y - 0.5) * 20}px))`
          }} />
      </div>

      {/* Floating Particles that follow cursor slightly */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-transform duration-[1000ms] ease-out"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              transform: `translate(${(mousePos.x - 0.5) * (i % 2 === 0 ? 15 : -15)}px, ${(mousePos.y - 0.5) * (i % 3 === 0 ? 15 : -15)}px)`
            }}
          />
        ))}
      </div>

      {/* ===== LIQUID GLASS CURTAIN ===== */}
      {/* Left Curtain Panel */}
      <div
        className="fixed inset-y-0 left-0 z-50 transition-transform duration-[1200ms]"
        style={{
          width: "50.5vw",
          transform: curtainOpen ? "translateX(-100%)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <div className="w-full h-full relative overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Glass refraction shimmer */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
            animation: "specularSweep 3s ease-out infinite",
          }} />
          <div className="absolute inset-0 flex items-center justify-end pr-2">
            <span className="text-white/90 text-6xl md:text-8xl font-black tracking-tight select-none">O</span>
          </div>
        </div>
      </div>

      {/* Right Curtain Panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 transition-transform duration-[1200ms]"
        style={{
          width: "50.5vw",
          transform: curtainOpen ? "translateX(100%)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <div className="w-full h-full relative overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="absolute inset-0" style={{
            background: "linear-gradient(255deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
            animation: "specularSweep 3s ease-out infinite",
            animationDelay: "0.5s",
          }} />
          <div className="absolute inset-0 flex items-center justify-start pl-2">
            <span className="text-white/90 text-6xl md:text-8xl font-black tracking-tight select-none">ccupyo</span>
          </div>
        </div>
      </div>

      {/* Glowing seam */}
      <div
        className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 z-[51] w-[1px]"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(180,230,255,0.8), transparent)",
          boxShadow: "0 0 30px rgba(180,230,255,0.5)",
          opacity: curtainOpen ? 0 : 1,
          transition: "opacity 0.4s ease-out",
        }}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        
        {/* Logo & Welcome */}
        <div
          className="text-center mb-16 transition-all duration-1000"
          style={{
            opacity: contentVisible ? 1 : 0,
            transform: contentVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-gray-100 bg-gray-50 backdrop-blur-md artifact-shimmer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-gray-500">Welcome to the future of flex space</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              Occupyo
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto font-medium">
            What would you like to do today?
          </p>
        </div>

        {/* ===== ACTION CARDS ===== */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl transition-all duration-1000 perspective-1000"
          style={{
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
          }}
        >
          {/* POST A PROPERTY Card */}
          <button
            onClick={() => router.push("/dashboard/owner")}
            onMouseEnter={() => setHoveredCard("post")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group glass-tilt relative rounded-[32px] p-8 md:p-10 text-left cursor-pointer outline-none"
            style={{
              background: hoveredCard === "post"
                ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))"
                : "rgba(255,255,255,0.03)",
              border: "1px solid",
              borderColor: hoveredCard === "post" ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              boxShadow: hoveredCard === "post"
                ? "var(--glass-specular-strong), 0 30px 60px -12px rgba(99,102,241,0.2), 0 0 30px rgba(99,102,241,0.1)"
                : "var(--glass-specular), 0 10px 30px -10px rgba(0,0,0,0.5)",
            }}
          >
            {/* Specular artifact */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 relative"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Building2 className="w-8 h-8 text-indigo-300 relative z-10" />
              <span className="absolute inset-0 rounded-2xl border-2 border-indigo-400/30 opacity-0 group-hover:opacity-100 animate-[pulseRing_2s_ease-out_infinite]" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Post a Property
            </h2>
            <p className="text-gray-400 text-base mb-8 leading-relaxed font-medium">
              List your warehouse, office, or flex space for businesses to discover and book.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm group-hover:gap-4 transition-all duration-300">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </button>

          {/* RENT A PROPERTY Card */}
          <button
            onClick={() => router.push("/dashboard/tenant")}
            onMouseEnter={() => setHoveredCard("rent")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group glass-tilt relative rounded-[32px] p-8 md:p-10 text-left cursor-pointer outline-none"
            style={{
              background: hoveredCard === "rent"
                ? "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(20,184,166,0.1))"
                : "rgba(255,255,255,0.03)",
              border: "1px solid",
              borderColor: hoveredCard === "rent" ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.1)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              boxShadow: hoveredCard === "rent"
                ? "var(--glass-specular-strong), 0 30px 60px -12px rgba(6,182,212,0.2), 0 0 30px rgba(6,182,212,0.1)"
                : "var(--glass-specular), 0 10px 30px -10px rgba(0,0,0,0.5)",
            }}
          >
            {/* Specular artifact */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 relative"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(20,184,166,0.15))",
                border: "1px solid rgba(6,182,212,0.3)",
              }}
            >
              <Search className="w-8 h-8 text-cyan-300 relative z-10" />
              <span className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 opacity-0 group-hover:opacity-100 animate-[pulseRing_2s_ease-out_infinite]" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              Rent a Property
            </h2>
            <p className="text-gray-400 text-base mb-8 leading-relaxed font-medium">
              Find flexible warehouse, office, and industrial spaces that match your business needs.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm group-hover:gap-4 transition-all duration-300">
              <span>Explore spaces</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        {/* Bottom tagline */}
        <div
          className="mt-16 text-center transition-all duration-1000 delay-500"
          style={{
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-gray-300 text-sm font-medium">
            Powered by Occupyo — B2B Flex Occupancy Marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
