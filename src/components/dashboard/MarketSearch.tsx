"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { matchDemand, MatchResult } from '@/lib/api/occupyo';
import { Search, Loader2, Building2, MapPin, Ruler, CheckCircle2, Send, DollarSign } from 'lucide-react';
import DemandIntakeModal from '../demand/DemandIntakeModal';

export default function MarketSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced semantic search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 10) {
        setIsSearching(true);
        setError(null);
        
        const res = await matchDemand({ query, source: 'frontend_search' });
        
        if (res.error) {
          setError(res.error);
          setResults([]);
        } else if (res.data) {
          setResults(res.data);
        }
        
        setIsSearching(false);
      } else {
        setResults([]);
        setError(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header & Intake Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Market Intelligence</h1>
          <p className="text-slate-500 mt-1">
            Discover real-time commercial inventory via semantic vector search.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2 border border-slate-700"
        >
          <Send className="w-4 h-4" />
          Submit Custom Requirements
        </button>
      </div>

      {/* Semantic Search Bar */}
      <div className="relative group z-10">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Looking for a 5,000 sqft creative office in downtown Austin under $40/sqft..."
          className="w-full pl-14 pr-4 py-4 bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all text-lg placeholder:text-slate-400"
        />
        
        {/* Subtle glow effect underneath */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg -z-10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Error state */}
      {error && !isSearching && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          Failed to fetch matches: {error}
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-4">
        {results.length > 0 && !error && (
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Top Intelligent Matches
          </h3>
        )}
        
        <AnimatePresence>
          {results.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white/80 backdrop-blur-lg border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300/50 transition-all cursor-pointer group overflow-hidden"
            >
              {/* Active Card Hover Glow */}
              <div className="absolute -inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative flex flex-col md:flex-row justify-between gap-6">
                
                {match.listing.image_url && (
                  <div className="md:w-48 h-32 md:h-auto flex-shrink-0 rounded-xl overflow-hidden relative border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={match.listing.image_url} 
                      alt={match.listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {match.listing.title}
                    </h2>
                    {match.listing.is_active && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Broker
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed max-w-2xl">
                    {match.listing.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      {match.listing.property_type}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      {match.listing.sub_market}, {match.listing.city}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Ruler className="w-4 h-4 text-indigo-500" />
                      {match.listing.square_footage.toLocaleString()} SQFT
                    </div>
                    {match.listing.price_per_sf && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <DollarSign className="w-4 h-4 text-indigo-500" />
                        ${match.listing.price_per_sf}/sqft
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-center min-w-[120px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600 drop-shadow-sm">
                    {Math.round(match.match_score * 100)}%
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Semantic Match
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {query.length > 10 && !isSearching && results.length === 0 && !error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 px-4 bg-white/50 backdrop-blur-sm border border-dashed border-slate-300 rounded-2xl"
          >
            <div className="text-slate-400 mb-2">
              <Search className="w-8 h-8 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No exact matches currently listed</h3>
            <p className="text-slate-500 mt-1 mb-4 max-w-md mx-auto">
              Our brokers might have off-market inventory. Submit your custom requirements to alert them instantly.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-indigo-600 font-medium hover:text-indigo-700 underline underline-offset-4"
            >
              Submit Requirements
            </button>
          </motion.div>
        )}
      </div>

      <DemandIntakeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
