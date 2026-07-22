"use client";

import { useState, useEffect } from "react";

const lines = [
  "We don't charge upfront.",
  "We charge only when you get a deal.",
  "Direct access to verified property owners.",
  "Zero hidden fees.",
  "The intelligent CRE marketplace."
];

export function FlippingText() {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % lines.length);
        setIsAnimating(false);
      }, 500); // Wait for fade out
    }, 3500); // Change every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-10 md:h-12 relative w-full flex justify-center items-center overflow-hidden">
      <div 
        className={`absolute w-full text-center transition-all duration-500 ease-in-out ${
          isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <p className="text-lg md:text-2xl font-semibold text-black drop-shadow-sm">
          {lines[index]}
        </p>
      </div>
    </div>
  );
}
