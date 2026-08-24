"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { matchDemand, ingestLead, MatchResult } from '@/lib/api/occupyo';
import { Search, Loader2, Building2, MapPin, Ruler, CheckCircle2, Send } from 'lucide-react';

export default function PropertySearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 10) {
        setIsSearching(true);
        try {
          const matches = await matchDemand({ query, source: 'frontend_search' });
          setResults(matches);
        } catch (e) {
          console.error("Search failed");
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [query]);

  const handleIngestSubmit = async () => {
    if (!modalInput.trim()) return;
    
    setIsSubmitting(true);
    const res = await ingestLead({ source: 'frontend_modal', content: modalInput });
    setIsSubmitting(false);
    
    if (res.status === 'accepted') {
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setModalInput('');
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header & Intake Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Occupyo Intelligence</h1>
          <p className="text-slate-500 mt-1">Describe your ideal commercial space in natural language.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit Custom Requirements
        </button>
      </div>

      {/* Semantic Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
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
          className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-lg placeholder:text-slate-400"
        />
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        {results.length > 0 && (
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Top Intelligent Matches
          </h3>
        )}
        <AnimatePresence>
          {results.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/70 backdrop-blur-lg border border-slate-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200/60 transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {match.listing.title}
                    </h2>
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Broker
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {match.listing.property_type}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {match.listing.sub_market}, {match.listing.city}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-slate-400" />
                      {match.listing.square_footage.toLocaleString()} SQFT
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-center">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {Math.round(match.match_score * 100)}%
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Match Score
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {query.length > 10 && !isSearching && results.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No exact matches found. Try adjusting your requirements or submit them for our brokers.
          </div>
        )}
      </div>

      {/* Demand Submission Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl z-50"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Submit Requirements</h2>
              <p className="text-slate-500 mb-6">
                Paste your exact requirements, email snippet, or notes. Our AI will extract the intent and notify matching verified brokers instantly.
              </p>
              
              <textarea
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder="We are a tech startup looking for 3,000 - 5,000 sqft in SoHo. Need open floor plan and high ceilings. Budget is around $60/sqft..."
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-6"
              />
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleIngestSubmit}
                  disabled={isSubmitting || submitSuccess || !modalInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : submitSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitSuccess ? 'Submitted!' : 'Submit to Brokers'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
