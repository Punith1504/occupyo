"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import LeadClaimCard, { LeadDossier } from '@/components/broker/LeadClaimCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

export default function BrokerIntelligenceDashboard() {
  const [leads, setLeads] = useState<LeadDossier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulating an API fetch or WebSocket connection for incoming leads
  useEffect(() => {
    const fetchMockLeads = async () => {
      // In production, this would call /api/v1/brokers/{id}/leads
      setIsLoading(true);
      setTimeout(() => {
        const mockData: LeadDossier[] = [
          {
            id: 'lead_1',
            source: 'reddit_api',
            raw_content: "Hey everyone, we are an AI startup seeking warehouse sublease. Need about 5000 sqft in Austin by next month.",
            property_type: "Industrial",
            target_city: "Austin",
            min_square_footage: 4000,
            max_square_footage: 6000,
            intent_score: 0.92,
            match_score: 0.88,
            status: "New",
            created_at: new Date().toISOString()
          },
          {
            id: 'lead_2',
            source: 'frontend_modal',
            raw_content: "Looking for a 2000 sqft creative office in downtown Austin under $40/sqft. Must have open floor plan.",
            property_type: "Office",
            target_city: "Austin",
            target_sub_market: "Downtown",
            min_square_footage: 1800,
            max_square_footage: 2500,
            target_budget_sf: 40,
            intent_score: 0.85,
            match_score: 0.76,
            status: "New",
            created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          }
        ];
        setLeads(mockData);
        setIsLoading(false);
      }, 1000);
    };

    fetchMockLeads();
  }, []);

  const handleClaim = (id: string) => {
    setLeads(current => current.map(lead => 
      lead.id === id ? { ...lead, status: 'Claimed' } : lead
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Demand Feed</h1>
            <p className="text-slate-500 mt-1">
              Real-time matched tenant requirements across your active sub-markets.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <SlidersHorizontal className="w-4 h-4" />
              Sort
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Scanning live data streams...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {leads.map((lead) => (
              <LeadClaimCard 
                key={lead.id} 
                lead={lead} 
                onClaim={handleClaim} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
