"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ingestAnonymousLead } from "@/app/actions/lead";
import {
  Search,
  Loader2,
  CheckCircle2,
  Send,
  Sparkles,
  AlertTriangle,
  Building2,
} from "lucide-react";
import SearchResultCard, { SearchResult } from "./SearchResultCard";
import SearchFilters from "./SearchFilters";
import SearchMap from "./SearchMap";

// Loading skeleton
function ResultSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <div className="h-8 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-100 rounded w-28 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default function PropertySearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [rawResults, setRawResults] = useState<SearchResult[]>([]);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Filter state
  const [activeType, setActiveType] = useState("ALL");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sizeRange, setSizeRange] = useState({ min: "", max: "" });

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 10) {
        setIsSearching(true);
        setHasSearched(true);
        try {
          const res = await fetch("/api/semantic-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, radiusMiles: 10 }),
          });
          const data = await res.json();
          if (data.success) {
            setRawResults(data.properties || []);
            setFallbackTriggered(data.fallbackTriggered || false);
          } else {
            setRawResults([]);
          }
        } catch (e) {
          console.error("Search failed", e);
          setRawResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        if (query.trim().length === 0) {
          setRawResults([]);
          setHasSearched(false);
          setFallbackTriggered(false);
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [query]);

  // Client-side filtering
  const filteredResults = rawResults.filter((r) => {
    if (activeType !== "ALL" && r.propertyType?.toUpperCase() !== activeType)
      return false;
    if (priceRange.min && (r.pricePerMonth || 0) < Number(priceRange.min))
      return false;
    if (priceRange.max && (r.pricePerMonth || Infinity) > Number(priceRange.max))
      return false;
    if (sizeRange.min && (r.sizeSqft || 0) < Number(sizeRange.min))
      return false;
    if (sizeRange.max && (r.sizeSqft || Infinity) > Number(sizeRange.max))
      return false;
    return true;
  });

  const resetFilters = () => {
    setActiveType("ALL");
    setPriceRange({ min: "", max: "" });
    setSizeRange({ min: "", max: "" });
  };

  const handleIngestSubmit = async () => {
    if (!modalInput.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await ingestAnonymousLead(modalInput);
      if (res.status === "accepted") {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitSuccess(false);
          setModalInput("");
        }, 2000);
      } else {
        alert(res.message || "Failed to submit lead");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToResult = useCallback((id: string) => {
    const el = document.getElementById(`result-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(id);
    }
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      {/* Header & Intake Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-500" />
            Occupyo Intelligence
          </h1>
          <p className="text-slate-500 mt-1">
            Describe your ideal commercial space in natural language.
          </p>
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
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "5,000 sqft creative office in downtown Minneapolis under $40/sqft"'
          className="w-full pl-14 pr-6 py-5 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400/50 transition-all text-lg placeholder:text-slate-400"
        />
      </div>

      {/* Fallback Banner */}
      {fallbackTriggered && rawResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            Some results were sourced from the web because no exact matches
            were found in our verified inventory. Please verify independently.
          </p>
        </motion.div>
      )}

      {/* Filters Bar — only show when we have results */}
      {hasSearched && rawResults.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SearchFilters
            activeType={activeType}
            onTypeChange={setActiveType}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            sizeRange={sizeRange}
            onSizeChange={setSizeRange}
            resultCount={filteredResults.length}
            onReset={resetFilters}
          />
        </motion.div>
      )}

      {/* Split Panel: Results (left) + Map (right) */}
      {isSearching ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
      ) : hasSearched && filteredResults.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Results List */}
          <div className="flex-1 lg:max-w-[60%]">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              {filteredResults.length} Intelligent{" "}
              {filteredResults.length === 1 ? "Match" : "Matches"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence>
                {filteredResults.map((result, i) => (
                  <div key={result.id} id={`result-${result.id}`}>
                    <SearchResultCard
                      result={result}
                      index={i}
                      isHighlighted={result.id === highlightedId}
                      onHover={setHighlightedId}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Map Panel */}
          <div className="lg:w-[40%] lg:sticky lg:top-6 lg:self-start">
            <div className="h-[500px] lg:h-[calc(100vh-200px)] rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm">
              <SearchMap
                results={filteredResults}
                highlightedId={highlightedId}
                onPinClick={scrollToResult}
              />
            </div>
          </div>
        </div>
      ) : hasSearched && !isSearching ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No matches found
          </h3>
          <p className="text-slate-400 max-w-md mb-6">
            Try adjusting your search query or submit your requirements for our
            verified brokers to review.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
          >
            <Send className="w-4 h-4" />
            Submit Requirements
          </button>
        </motion.div>
      ) : null}

      {/* Demand Submission Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl z-50"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Submit Requirements
              </h2>
              <p className="text-slate-500 mb-6">
                Paste your exact requirements, email snippet, or notes. Our AI
                will extract the intent and notify matching verified brokers
                instantly.
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
                  {submitSuccess ? "Submitted!" : "Submit to Brokers"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
