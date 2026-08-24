"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Activity } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8000/health');
        if (res.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (e) {
        setApiStatus('error');
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/70 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Occupyo</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'border-indigo-500 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Tenant Discovery
            </Link>
            <Link 
              href="/dashboard" 
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                pathname === '/dashboard' 
                  ? 'border-indigo-500 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Broker Intelligence
            </Link>
          </nav>

          {/* Status & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">FastAPI:</span>
              {apiStatus === 'connecting' && <span className="text-amber-500 animate-pulse">Checking...</span>}
              {apiStatus === 'connected' && <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected</span>}
              {apiStatus === 'error' && <span className="text-rose-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Disconnected</span>}
            </div>
            
            <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
