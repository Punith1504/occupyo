"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, PlusCircle, Settings, MessageSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import { hapticTap } from "@/lib/haptics";

const NAV_ITEMS = [
  { href: "/dashboard/owner", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/owner/listings/create", label: "Add Property", icon: PlusCircle },
  { href: "/dashboard/owner/leases", label: "My Leases", icon: Building2 },
  { href: "/dashboard/owner/requests", label: "Tenant Requests", icon: Settings },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/owner/settings", label: "Settings", icon: Settings },
];

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row relative">
      {/* Mobile Top Navbar */}
      <div className="md:hidden glass-navbar flex items-center justify-between p-4 sticky top-0 z-50 border-b border-white/10">
        <Link href="/">
          <span className="text-xl font-bold text-white tracking-tight">Occupyo</span>
        </Link>
        <div className="flex items-center gap-4">
          <UserButton />
          <button 
            onClick={() => {
              hapticTap();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex absolute top-[65px] left-0 right-0 z-50 glass-heavy pb-4 border-b border-white/10' : 'hidden'} 
        md:flex md:relative md:top-0 md:w-64 glass-heavy border-r border-white/10 flex-col shrink-0 md:min-h-screen
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-white/10">
          <Link href="/">
            <span className="text-xl font-bold text-white tracking-tight">Occupyo</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            
            return (
              <Link 
                key={item.href}
                onClick={() => {
                  hapticTap();
                  setIsMobileMenuOpen(false);
                }} 
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                  ${active 
                    ? 'nav-link-active bg-[#b4e6ff]/12 text-white border border-[#b4e6ff]/15 shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'}`
                }
              >
                <Icon className={`h-5 w-5 ${active ? 'text-[#b4e6ff]' : 'text-white/40'}`} />
                {item.label}
              </Link>
            );
          })}
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
