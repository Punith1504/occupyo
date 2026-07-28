export function TrustSignals() {
  return (
    <section className="py-12 border-t border-gray-200 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-semibold text-gray-500 tracking-widest uppercase mb-8">
          Trusted by innovative companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder logos using Lucide icons or simple text for now, could be replaced by actual SVGs */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <span className="text-xl font-bold text-gray-600">Acme Corp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gray-200 transform rotate-45"></div>
            <span className="text-xl font-bold text-gray-600">Stark Ind.</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <span className="text-xl font-bold text-gray-600">GlobalTech</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gray-200"></div>
            <span className="text-xl font-bold text-gray-600">OmniCorp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 transform -rotate-12"></div>
            <span className="text-xl font-bold text-gray-600">Initech</span>
          </div>
        </div>
      </div>
    </section>
  );
}
