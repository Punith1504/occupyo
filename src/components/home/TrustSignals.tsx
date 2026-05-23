export function TrustSignals() {
  return (
    <section className="py-12 border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-semibold text-white/50 tracking-widest uppercase mb-8">
          Trusted by innovative companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder logos using Lucide icons or simple text for now, could be replaced by actual SVGs */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20"></div>
            <span className="text-xl font-bold text-white">Acme Corp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white/20 transform rotate-45"></div>
            <span className="text-xl font-bold text-white">Stark Ind.</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20"></div>
            <span className="text-xl font-bold text-white">GlobalTech</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white/20"></div>
            <span className="text-xl font-bold text-white">OmniCorp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 transform -rotate-12"></div>
            <span className="text-xl font-bold text-white">Initech</span>
          </div>
        </div>
      </div>
    </section>
  );
}
