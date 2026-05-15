"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, ArrowRight, Sparkles } from "lucide-react";

export default function DashboardHub() {
  const router = useRouter();
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    // Trigger curtain opening after a brief pause
    const t1 = setTimeout(() => setCurtainOpen(true), 300);
    // Show content after curtain opens
    const t2 = setTimeout(() => setContentVisible(true), 1000);
    // Stagger card entrance
    const t3 = setTimeout(() => setCardsVisible(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 60%, #0f0f1a 100%)" }}>
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] animate-pulse"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)", top: "-200px", left: "-100px", animationDuration: "4s" }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] animate-pulse"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", bottom: "-150px", right: "-100px", animationDuration: "5s", animationDelay: "1s" }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] animate-pulse"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)", top: "40%", left: "50%", transform: "translateX(-50%)", animationDuration: "6s", animationDelay: "2s" }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* ===== LIQUID GLASS CURTAIN ===== */}
      {/* Left Curtain Panel */}
      <div
        className="fixed inset-y-0 left-0 z-50 transition-transform duration-[1200ms]"
        style={{
          width: "50vw",
          transform: curtainOpen ? "translateX(-100%)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <div className="w-full h-full relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2), rgba(6,182,212,0.15))",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            borderRight: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* Glass refraction shimmer */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)",
            animation: "shimmer 3s ease-in-out infinite",
          }} />
          <div className="absolute inset-0 flex items-center justify-end pr-16">
            <span className="text-white/30 text-6xl font-bold tracking-widest select-none" style={{ fontFamily: "system-ui" }}>O</span>
          </div>
        </div>
      </div>

      {/* Right Curtain Panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 transition-transform duration-[1200ms]"
        style={{
          width: "50vw",
          transform: curtainOpen ? "translateX(100%)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <div className="w-full h-full relative overflow-hidden"
          style={{
            background: "linear-gradient(225deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2), rgba(6,182,212,0.15))",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            borderLeft: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="absolute inset-0" style={{
            background: "linear-gradient(255deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)",
            animation: "shimmer 3s ease-in-out infinite",
            animationDelay: "0.5s",
          }} />
          <div className="absolute inset-0 flex items-center justify-start pl-16">
            <span className="text-white/30 text-6xl font-bold tracking-widest select-none" style={{ fontFamily: "system-ui" }}>ccupyo</span>
          </div>
        </div>
      </div>

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
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white/60">Welcome to the future of flex space</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              Occupyo
            </span>
          </h1>
          <p className="text-lg text-white/40 max-w-md mx-auto">
            What would you like to do today?
          </p>
        </div>

        {/* ===== ACTION CARDS ===== */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl transition-all duration-1000"
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
            className="group relative rounded-3xl p-8 md:p-10 text-left transition-all duration-500 cursor-pointer"
            style={{
              background: hoveredCard === "post"
                ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))"
                : "rgba(255,255,255,0.04)",
              border: "1px solid",
              borderColor: hoveredCard === "post" ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)",
              backdropFilter: "blur(30px) saturate(150%)",
              WebkitBackdropFilter: "blur(30px) saturate(150%)",
              transform: hoveredCard === "post" ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
              boxShadow: hoveredCard === "post"
                ? "0 25px 60px -12px rgba(99,102,241,0.3), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 4px 24px -4px rgba(0,0,0,0.3)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.15), transparent 70%)" }} />
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                border: "1px solid rgba(99,102,241,0.3)",
                boxShadow: hoveredCard === "post" ? "0 0 30px rgba(99,102,241,0.3)" : "none",
              }}
            >
              <Building2 className="w-8 h-8 text-indigo-300" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
              Post a Property
            </h2>
            <p className="text-white/40 text-base mb-8 leading-relaxed">
              List your warehouse, office, or flex space for businesses to discover and book.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm group-hover:gap-4 transition-all duration-300">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full overflow-hidden">
              <div className="h-full transition-all duration-700 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  width: hoveredCard === "post" ? "100%" : "0%",
                }} />
            </div>
          </button>

          {/* RENT A PROPERTY Card */}
          <button
            onClick={() => router.push("/dashboard/tenant")}
            onMouseEnter={() => setHoveredCard("rent")}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative rounded-3xl p-8 md:p-10 text-left transition-all duration-500 cursor-pointer"
            style={{
              background: hoveredCard === "rent"
                ? "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(20,184,166,0.2))"
                : "rgba(255,255,255,0.04)",
              border: "1px solid",
              borderColor: hoveredCard === "rent" ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.08)",
              backdropFilter: "blur(30px) saturate(150%)",
              WebkitBackdropFilter: "blur(30px) saturate(150%)",
              transform: hoveredCard === "rent" ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
              boxShadow: hoveredCard === "rent"
                ? "0 25px 60px -12px rgba(6,182,212,0.3), 0 0 0 1px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 4px 24px -4px rgba(0,0,0,0.3)",
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.15), transparent 70%)" }} />
            </div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(20,184,166,0.2))",
                border: "1px solid rgba(6,182,212,0.3)",
                boxShadow: hoveredCard === "rent" ? "0 0 30px rgba(6,182,212,0.3)" : "none",
              }}
            >
              <Search className="w-8 h-8 text-cyan-300" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
              Rent a Property
            </h2>
            <p className="text-white/40 text-base mb-8 leading-relaxed">
              Find flexible warehouse, office, and industrial spaces that match your business needs.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm group-hover:gap-4 transition-all duration-300">
              <span>Explore spaces</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full overflow-hidden">
              <div className="h-full transition-all duration-700 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #06b6d4, #14b8a6)",
                  width: hoveredCard === "rent" ? "100%" : "0%",
                }} />
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
          <p className="text-white/20 text-sm">
            Powered by Occupyo — B2B Flex Occupancy Marketplace
          </p>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
