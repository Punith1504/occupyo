"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ArrowRight, Shield, Zap, Users, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false);

  useEffect(() => {
    // Start curtain opening
    const t1 = setTimeout(() => setCurtainOpen(true), 400);
    // Remove curtain from DOM after animation
    const t2 = setTimeout(() => setCurtainGone(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ===== LIQUID GLASS CURTAIN OVERLAY ===== */}
      {!curtainGone && (
        <>
          {/* Left Curtain Panel */}
          <div
            className="fixed inset-y-0 left-0 z-[100]"
            style={{
              width: "50.5vw",
              transform: curtainOpen ? "translateX(-101%)" : "translateX(0)",
              transition: "transform 1.2s cubic-bezier(0.76, 0, 0.24, 1)",
            }}
          >
            <div className="w-full h-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(15,15,26,0.97), rgba(26,26,46,0.95), rgba(22,33,62,0.93))",
                backdropFilter: "blur(60px) saturate(200%)",
                WebkitBackdropFilter: "blur(60px) saturate(200%)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Glass shimmer effect */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 42%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 58%, transparent 65%)",
                animation: "curtainShimmer 2.5s ease-in-out infinite",
              }} />
              {/* Gradient accent */}
              <div className="absolute inset-0 opacity-30" style={{
                background: "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.4), transparent 70%)",
              }} />
              {/* Logo left half */}
              <div className="absolute inset-0 flex items-center justify-end pr-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-10 h-10 text-indigo-400/60" />
                  <span className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-white/80 via-indigo-200/60 to-transparent bg-clip-text text-transparent select-none">
                    Occ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Curtain Panel */}
          <div
            className="fixed inset-y-0 right-0 z-[100]"
            style={{
              width: "50.5vw",
              transform: curtainOpen ? "translateX(101%)" : "translateX(0)",
              transition: "transform 1.2s cubic-bezier(0.76, 0, 0.24, 1)",
            }}
          >
            <div className="w-full h-full relative overflow-hidden"
              style={{
                background: "linear-gradient(225deg, rgba(15,15,26,0.97), rgba(26,26,46,0.95), rgba(22,33,62,0.93))",
                backdropFilter: "blur(60px) saturate(200%)",
                WebkitBackdropFilter: "blur(60px) saturate(200%)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="absolute inset-0" style={{
                background: "linear-gradient(255deg, transparent 35%, rgba(255,255,255,0.04) 42%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 58%, transparent 65%)",
                animation: "curtainShimmer 2.5s ease-in-out infinite",
                animationDelay: "0.3s",
              }} />
              <div className="absolute inset-0 opacity-30" style={{
                background: "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.4), transparent 70%)",
              }} />
              {/* Logo right half */}
              <div className="absolute inset-0 flex items-center justify-start pl-4">
                <span className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-l from-white/80 via-cyan-200/60 to-transparent bg-clip-text text-transparent select-none">
                  upyo
                </span>
              </div>
            </div>
          </div>

          {/* Center seam glow line */}
          <div
            className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 z-[101] w-[2px]"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(139,92,246,0.6), rgba(6,182,212,0.6), transparent)",
              opacity: curtainOpen ? 0 : 1,
              transition: "opacity 0.6s ease-out",
            }}
          />
        </>
      )}

      {/* ===== PAGE CONTENT (revealed by curtain) ===== */}
      <div
        style={{
          opacity: curtainOpen ? 1 : 0,
          transform: curtainOpen ? "scale(1)" : "scale(0.98)",
          transition: "opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s",
        }}
      >
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-black" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Occupyo</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/onboarding" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                Get Started
              </Link>
              <Link href="/sign-in" className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 mb-8">
              <Zap className="w-3.5 h-3.5" />
              B2B Flex Occupancy Marketplace
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Flexible workspace,<br />
              <span className="bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 bg-clip-text text-transparent">
                zero friction.
              </span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              The modern marketplace connecting commercial property owners with businesses seeking flexible warehouse, office, and industrial space.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="bg-black text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/20 flex items-center gap-2"
              >
                List Your Space
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/onboarding"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-50 transition-colors"
              >
                Find a Space
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Properties Listed" },
              { value: "120K", label: "Sqft Available" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "$2.4M", label: "Monthly Volume" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for modern businesses</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                Whether you own flex space or need it, Occupyo streamlines the entire lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Building2,
                  title: "List in Minutes",
                  description: "Guided multi-step wizard to publish your warehouse, flex, or office space with photos, amenities, and lease terms.",
                },
                {
                  icon: Users,
                  title: "Reverse Marketplace",
                  description: "Tenants post exactly what they need. Owners browse requests and reach out — no cold outreach necessary.",
                },
                {
                  icon: Shield,
                  title: "Secure Transactions",
                  description: "Built-in lease management with approval workflows. Every request is verified and tracked end-to-end.",
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Occupyo works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">For Owners</h3>
                <div className="space-y-6">
                  {[
                    "Create your account and verify your identity",
                    "List your property with photos, pricing, and lease terms",
                    "Review incoming booking requests from verified tenants",
                    "Approve and manage active leases from your dashboard",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">For Tenants</h3>
                <div className="space-y-6">
                  {[
                    "Sign up and tell us about your business needs",
                    "Search available spaces or post a custom Space Request",
                    "Select your lease terms and submit a booking request",
                    "Get approved and move in — it's that simple",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to transform your commercial real estate experience?
            </h2>
            <p className="text-lg text-gray-500 mb-10">
              Join hundreds of property owners and businesses already using Occupyo.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-500">Occupyo</span>
            </div>
            <p className="text-sm text-gray-400">© 2026 Occupyo. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes curtainShimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  );
}
