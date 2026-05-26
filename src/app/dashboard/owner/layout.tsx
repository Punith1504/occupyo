"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Building2, LayoutDashboard, PlusCircle, Settings, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row relative">
      {/* Mobile Top Navbar */}
      <div className="md:hidden glass-navbar flex items-center justify-between p-4 sticky top-0 z-50 border-b border-white/10">
        <span className="text-xl font-bold text-white tracking-tight">Occupyo</span>
        <div className="flex items-center gap-4">
          <UserButton />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex absolute top-[65px] left-0 right-0 z-50 glass-heavy pb-4 border-b border-white/10' : 'hidden'} 
        md:flex md:relative md:top-0 md:w-64 glass-heavy border-r border-white/10 flex-col shrink-0
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold text-white tracking-tight">Occupyo</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/owner" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-white bg-white/10 shadow-sm border border-white/10">
            <LayoutDashboard className="h-5 w-5 text-[#b4e6ff]" />
            Overview
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/owner/listings/create" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <PlusCircle className="h-5 w-5 text-white/50" />
            Add Property
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/owner/leases" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Building2 className="h-5 w-5 text-white/50" />
            My Leases
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/owner/requests" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="h-5 w-5 text-white/50" />
            Tenant Requests
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/messages" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <MessageSquare className="h-5 w-5 text-white/50" />
            Messages
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/owner/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="h-5 w-5 text-white/50" />
            Settings
          </Link>
        </nav>
        <div className="hidden md:flex p-4 border-t border-white/10 items-center gap-3 bg-black/20">
          <UserButton />
          <span className="text-sm font-medium text-white/80">Account</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
