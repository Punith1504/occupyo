"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Search, LayoutDashboard, Settings, FileText, ClipboardList, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";

export default function TenantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between p-4 sticky top-0 z-50">
        <span className="text-xl font-bold text-gray-900 tracking-tight">Occupyo</span>
        <div className="flex items-center gap-4">
          <UserButton />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex absolute top-[65px] left-0 right-0 z-50 shadow-lg pb-4' : 'hidden'} 
        md:flex md:relative md:top-0 md:w-64 bg-white border-r border-gray-200 flex-col shrink-0
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-900 tracking-tight">Occupyo</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/tenant" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
            <LayoutDashboard className="h-5 w-5 text-gray-500" />
            Overview
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/tenant/search" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Search className="h-5 w-5 text-gray-400" />
            Search Properties
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/tenant/leases" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <ClipboardList className="h-5 w-5 text-gray-400" />
            My Leases
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/tenant/requests" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-gray-400" />
            Space Requests
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/messages" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            Messages
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard/tenant/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-400" />
            Settings
          </Link>
        </nav>
        <div className="hidden md:flex p-4 border-t border-gray-200 items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium text-gray-700">Account</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
