export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6 text-gray-800 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium tracking-wider uppercase text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
