"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Header from '@/components/layout/Header';
import LeadClaimCard from '@/components/broker/LeadClaimCard';
import { getBrokerLeadFeed, claimLead } from '@/app/actions/broker';
import { Filter, SlidersHorizontal, RefreshCcw, Loader2, Inbox } from 'lucide-react';

interface ScoredLead {
  id: string;
  source: string;
  rawContent: string;
  propertyType: string;
  targetCity: string;
  minSqft: number;
  maxBudget: number;
  durationMonths: number;
  intentScore: number;
  matchScore: number;
  status: "New" | "Claimed";
  createdAt: string;
  tenant: {
    id: string;
    companyName: string | null;
    email: string;
  };
}

export default function BrokerIntelligenceDashboard() {
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"match" | "intent" | "newest">("match");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const result = await getBrokerLeadFeed();
      if (result.success && result.leads) {
        setLeads(result.leads as ScoredLead[]);
      }
    } catch (e) {
      console.error("Failed to fetch leads:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleClaim = (id: string) => {
    startTransition(async () => {
      const result = await claimLead(id);
      if (result.success) {
        setLeads((current) =>
          current.map((lead) =>
            lead.id === id ? { ...lead, status: "Claimed" as const } : lead
          )
        );
      } else {
        console.error("Claim failed:", result.error);
      }
    });
  };

  const handleIgnore = (id: string) => {
    setLeads((current) => current.filter((lead) => lead.id !== id));
  };

  // Filter and sort
  let displayed = [...leads];
  if (filterType) {
    displayed = displayed.filter(
      (l) => l.propertyType.toUpperCase() === filterType.toUpperCase()
    );
  }
  if (sortBy === "match") {
    displayed.sort((a, b) => b.matchScore - a.matchScore);
  } else if (sortBy === "intent") {
    displayed.sort((a, b) => b.intentScore - a.intentScore);
  } else {
    displayed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const propertyTypes = [...new Set(leads.map((l) => l.propertyType))];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Live Demand Feed
            </h1>
            <p className="text-slate-500 mt-1">
              Real-time matched tenant requirements across your active
              sub-markets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Property type filter */}
            <div className="relative">
              <select
                value={filterType || ""}
                onChange={(e) =>
                  setFilterType(e.target.value || null)
                }
                className="appearance-none bg-white border border-slate-200 text-slate-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                <option value="">All Types</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "match" | "intent" | "newest")
                }
                className="appearance-none bg-white border border-slate-200 text-slate-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                <option value="match">Best Match</option>
                <option value="intent">Highest Intent</option>
                <option value="newest">Newest First</option>
              </select>
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Refresh button */}
            <button
              onClick={fetchLeads}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCcw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-slate-400 font-medium">
              Scanning live data streams...
            </p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
            <Inbox className="w-12 h-12" />
            <p className="font-medium text-lg">No open leads right now</p>
            <p className="text-sm">
              New tenant requests will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayed.map((lead) => (
              <LeadClaimCard
                key={lead.id}
                lead={{
                  id: lead.id,
                  source: lead.source,
                  raw_content: lead.rawContent,
                  property_type: lead.propertyType,
                  target_city: lead.targetCity,
                  min_square_footage: lead.minSqft,
                  max_square_footage: lead.minSqft * 1.5, // Approximate range
                  target_budget_sf: lead.maxBudget > 0 ? Math.round(lead.maxBudget / Math.max(lead.minSqft, 1)) : undefined,
                  intent_score: lead.intentScore,
                  match_score: lead.matchScore,
                  status: lead.status,
                  created_at: lead.createdAt,
                }}
                onClaim={handleClaim}
                onIgnore={handleIgnore}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
