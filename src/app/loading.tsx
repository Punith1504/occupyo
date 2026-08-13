export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="text-white/60 font-medium tracking-wider uppercase text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
