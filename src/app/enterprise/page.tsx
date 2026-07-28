"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  HeadphonesIcon,
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const EnterpriseFeatures = [
  {
    icon: <Globe className="w-8 h-8 text-[#b4e6ff]" />,
    title: "Multi-Location Portfolio Management",
    description: "Manage hundreds of warehouse locations from a single pane of glass. Standardize your procurement and leasing processes globally."
  },
  {
    icon: <Zap className="w-8 h-8 text-[#cbb4ff]" />,
    title: "Custom API & ERP Integrations",
    description: "Seamlessly connect Occupyo with your existing WMS, ERP, and supply chain software. Automate inventory and space allocation."
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-[#b4e6ff]" />,
    title: "Advanced Yield & ROI Analytics",
    description: "Get granular insights into space utilization, Cap Rate forecasting, and NOI optimization across your entire real estate portfolio."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-[#cbb4ff]" />,
    title: "Enterprise-Grade Security & Compliance",
    description: "SOC2 compliant infrastructure, custom SSO, Role-Based Access Control (RBAC), and rigorous vendor screening processes."
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8 text-[#b4e6ff]" />,
    title: "Dedicated Success Manager",
    description: "A dedicated account manager and 24/7 priority SLA support to ensure your logistics operations never skip a beat."
  },
  {
    icon: <Building2 className="w-8 h-8 text-[#cbb4ff]" />,
    title: "Volume-Based Tiered Pricing",
    description: "Aggressive pricing models designed for scale. Pay less per square foot as your footprint on the Occupyo network grows."
  }
];

export default function EnterpriseSolutionsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#b4e6ff] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.05] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#cbb4ff] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.05] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        
        {/* Navigation / Back */}
        <div className="container mx-auto px-6 py-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-12 pb-24 lg:pt-24 lg:pb-32">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#b4e6ff] animate-pulse" />
              <span className="text-sm font-medium tracking-wide text-[#b4e6ff]">OCCUPYO FOR ENTERPRISE</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Scale Your Logistics <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b4e6ff] via-white to-[#cbb4ff]">
                Without Boundaries
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              The premier marketplace for commercial warehousing. Streamline portfolio management, automate workflows, and unlock massive ROI with our enterprise-grade infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#b4e6ff] to-[#cbb4ff] rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500" />
                <Link 
                  href="mailto:sales@occupyo.com" 
                  className="relative flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Contact Sales <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <Link 
                href="/sign-in" 
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 active:scale-95 transition-all duration-300 backdrop-blur-sm"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section className="border-y border-white/10 bg-white/[0.01] backdrop-blur-3xl relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
          <div className="container mx-auto px-6 py-24">
            
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for scale, designed for speed</h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Everything you need to manage a massive global footprint of industrial spaces in one unified platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EnterpriseFeatures.map((feature, idx) => (
                <div 
                  key={idx}
                  className="group bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 hover:-translate-y-1 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_20px_40px_-20px_rgba(180,230,255,0.15)]"
                  style={{
                    transitionDelay: mounted ? `${idx * 100}ms` : '0ms',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-white/50 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Preview Section */}
        <section className="container mx-auto px-6 py-24">
          <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#b4e6ff]/10 to-transparent pointer-events-none" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Connect your <br />
                  entire stack.
                </h2>
                <p className="text-white/60 text-lg mb-8 max-w-md">
                  Sync Occupyo with your existing Enterprise Resource Planning (ERP) and warehouse management systems via our secure GraphQL API.
                </p>
                <ul className="space-y-4 mb-8">
                  {['Automated Inventory Sync', 'Real-time Capacity Updates', 'Automated Lease Generation', 'Direct Billing Integration'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#b4e6ff]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="mailto:api@occupyo.com"
                  className="inline-flex items-center text-[#b4e6ff] font-semibold hover:text-white transition-colors"
                >
                  Request API Access <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Decorative Mockup */}
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl p-6 shadow-2xl relative">
                  <div className="flex gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="text-[#cbb4ff]">query GetEnterprisePortfolio {'{'}</div>
                    <div className="pl-4 text-[#b4e6ff]">portfolio(id: "ent_xyz") {'{'}</div>
                    <div className="pl-8 text-white/70">totalSqft</div>
                    <div className="pl-8 text-white/70">activeLeases</div>
                    <div className="pl-8 text-white/70">utilizationRate</div>
                    <div className="pl-4 text-[#b4e6ff]">{'}'}</div>
                    <div className="text-[#cbb4ff]">{'}'}</div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -right-8 top-1/4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl animate-bounce" style={{ animationDuration: '4s' }}>
                    <div className="text-xs text-white/50 mb-1">Utilization</div>
                    <div className="text-xl font-bold text-green-400">94.2%</div>
                  </div>
                  <div className="absolute -left-8 bottom-1/4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                    <div className="text-xs text-white/50 mb-1">Active Space</div>
                    <div className="text-xl font-bold text-[#b4e6ff]">2.4M sqft</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to upgrade your logistics?</h2>
          <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto">
            Join the world's leading brands who trust Occupyo to manage their warehousing and distribution network.
          </p>
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#b4e6ff] to-[#cbb4ff] rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
            <Link 
              href="mailto:sales@occupyo.com" 
              className="relative flex items-center gap-3 bg-black text-white border border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all duration-300"
            >
              Contact our Sales Team
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
