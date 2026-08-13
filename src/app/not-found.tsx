import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[var(--bg-cream)] font-[var(--font-sans)]">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-[var(--border-soft)] rounded-3xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-[var(--accent-teal-soft)] text-[var(--accent-teal)] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">Page Not Found</h2>
        
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          We couldn't find the page you were looking for. It might have been removed, renamed, or didn't exist in the first place.
        </p>

        <Link
          href="/"
          className="w-full py-3.5 px-4 bg-[var(--accent-teal)] text-white font-semibold rounded-xl shadow-md hover:bg-[#0D9488] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
