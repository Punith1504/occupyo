"use client";

import { useState, useEffect } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1416339442236-8ceb164046f8?q=80&w=2000&auto=format&fit=crop"
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {IMAGES.map((src, index) => (
        <div
          key={src}
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out pointer-events-none"
          style={{
            backgroundImage: `url('${src}')`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
      {/* Gradient Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF7]/95 via-[#FAFAF7]/70 to-[#FAFAF7] z-[1] pointer-events-none" />
      
      {/* Vibrant Colorful Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none opacity-[0.85]">
        {/* Top Left Teal/Emerald Orb */}
        <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-gradient-to-tr from-teal-400/40 to-emerald-300/40 rounded-full blur-[120px] mix-blend-multiply" />
        
        {/* Middle Right Cyan/Blue Orb */}
        <div className="absolute top-[10%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-bl from-cyan-400/30 to-blue-300/30 rounded-full blur-[130px] mix-blend-multiply" />
        
        {/* Bottom Center Mint Orb */}
        <div className="absolute -bottom-[30%] left-[20%] w-[900px] h-[600px] bg-gradient-to-r from-emerald-300/30 to-teal-200/30 rounded-full blur-[140px] mix-blend-multiply" />
      </div>
    </>
  );
}
