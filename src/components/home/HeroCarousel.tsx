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
      <div className="absolute inset-0 bg-white/60 z-[1] pointer-events-none" />
    </>
  );
}
