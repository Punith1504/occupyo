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
    <div className="flex-1 flex flex-col md:flex-row relative">
      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex absolute top-0 left-0 right-0 z-50 bg-white pb-4 border-b border-gray-200 shadow-md' : 'hidden'} 
        md:flex md:relative md:top-0 md:w-64 bg-white/60 border-r border-gray-200 flex-col shrink-0 md:min-h-[calc(100vh-80px)] backdrop-blur-xl
      `}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-gray-200">
          <Link href="/">
            <span className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</span>
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
                    ? 'nav-link-active bg-teal-50 text-teal-700 border border-teal-100 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`
                }
              >
                <Icon className={`h-5 w-5 ${active ? 'text-teal-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:flex p-4 border-t border-gray-200 items-center gap-3 bg-gray-50/50">
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
