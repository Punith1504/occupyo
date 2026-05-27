import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About Occupyo | The Next-Gen CRE Platform",
  description: "Learn about the mission behind Occupyo and how we are disrupting commercial real estate by making space occupancy friction-free.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/10 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24 sm:py-32">
        <div className="space-y-24">
          
          {/* Hero Section */}
          <section className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Why</span> Behind Occupyo
            </h1>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light">
              We started with a simple question: Why is finding and booking commercial real estate in the 21st century still so archaic, opaque, and painful?
            </p>
          </section>

          {/* The Problem */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold">The Friction</h2>
              <p className="text-white/60 leading-relaxed text-lg">
                For decades, the commercial real estate (CRE) market has been dominated by gatekeepers, hidden fees, and months-long negotiation cycles. Whether you're a startup looking for a flex space, or a landlord trying to monetize empty square footage, the process was designed to slow you down.
              </p>
            </div>
            <div className="h-64 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center">
              {/* Placeholder for an abstract image or data visualization */}
              <div className="text-white/30 text-sm font-medium tracking-widest uppercase">The Old Way</div>
            </div>
          </section>

          {/* The Solution */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 h-64 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
              <div className="text-white font-semibold tracking-widest uppercase z-10">The Occupyo Way</div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl font-semibold">The Solution</h2>
              <p className="text-white/60 leading-relaxed text-lg">
                Occupyo is the antidote. We built an intelligent marketplace that connects ambitious companies with premium spaces instantly. We enforce transparent pricing, digitize the entire leasing process, and provide landlords with the tools to maximize their yield without the headache.
              </p>
            </div>
          </section>

          {/* The Vision */}
          <section className="text-center max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-semibold">Our Vision</h2>
            <p className="text-xl text-white/80 leading-relaxed">
              We envision a world where physical space is as liquid and accessible as cloud computing. A world where businesses can spin up a headquarters as easily as a server. That's the future we are building at Occupyo.
            </p>
            <div className="pt-8">
              <Link 
                href="/dashboard/tenant" 
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Find Your Space
              </Link>
            </div>
          </section>

        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
