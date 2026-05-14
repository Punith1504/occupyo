import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Building2, LayoutDashboard, PlusCircle, Settings, MessageSquare } from "lucide-react";

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-gray-900 tracking-tight">Occupio</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard/owner" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors">
            <LayoutDashboard className="h-5 w-5 text-gray-500" />
            Overview
          </Link>
          <Link href="/dashboard/owner/listings/create" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <PlusCircle className="h-5 w-5 text-gray-400" />
            Add Property
          </Link>
          <Link href="/dashboard/owner/leases" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Building2 className="h-5 w-5 text-gray-400" />
            My Leases
          </Link>
          <Link href="/dashboard/owner/requests" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-400" />
            Tenant Requests
          </Link>
          <Link href="/dashboard/messages" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            Messages
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-400" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200 flex items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium text-gray-700">Account</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
