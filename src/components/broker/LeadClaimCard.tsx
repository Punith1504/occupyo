"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Ruler, DollarSign, Calendar, MessageSquare, Check, PhoneCall, Video } from 'lucide-react';

export interface LeadDossier {
  id: string;
  source: string;
  raw_content: string;
  property_type: string;
  target_city: string;
  target_sub_market?: string;
  min_square_footage: number;
  max_square_footage: number;
  target_budget_sf?: number;
  intent_score: number;
  match_score: number;
  status: 'New' | 'Claimed' | 'Ignored';
  created_at: string;
}

interface LeadClaimCardProps {
  lead: LeadDossier;
  onClaim?: (id: string) => void;
  onIgnore?: (id: string) => void;
}

export default function LeadClaimCard({ lead, onClaim, onIgnore }: LeadClaimCardProps) {
  const [actionState, setActionState] = useState<'idle' | 'claiming' | 'success'>('idle');

  const handleClaim = (type: 'direct' | 'handoff' | 'tour') => {
    setActionState('claiming');
    // Simulate API call for claiming
    setTimeout(() => {
      setActionState('success');
      if (onClaim) {
        setTimeout(() => onClaim(lead.id), 1000);
      }
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {/* Header section */}
      <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              {lead.status} LEAD
            </span>
            <span className="text-sm text-slate-500 font-medium">
              Source: {lead.source === 'frontend_modal' ? 'Direct Submission' : lead.source}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Tenant looking for {lead.property_type}
          </h3>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Received {new Date(lead.created_at).toLocaleDateString()}
          </p>
        </div>
        
        {/* Match Score Badge */}
        <div className="flex flex-col items-center justify-center bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <span className="text-2xl font-black text-indigo-600">{Math.round(lead.match_score * 100)}%</span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Match</span>
        </div>
      </div>

      {/* Details section */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Target Area
            </div>
            <div className="font-medium text-slate-900">
              {lead.target_sub_market ? `${lead.target_sub_market}, ` : ''}{lead.target_city}
            </div>
          </div>
          
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" /> Size Required
            </div>
            <div className="font-medium text-slate-900">
              {lead.min_square_footage.toLocaleString()} - {lead.max_square_footage.toLocaleString()} sqft
            </div>
          </div>
          
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Budget (per sqft)
            </div>
            <div className="font-medium text-slate-900">
              {lead.target_budget_sf ? `$${lead.target_budget_sf}` : 'Not specified'}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Intent Score
            </div>
            <div className="font-medium text-slate-900">
              {lead.intent_score > 0.8 ? 'High' : lead.intent_score > 0.5 ? 'Medium' : 'Low'} ({(lead.intent_score * 100).toFixed(0)}%)
            </div>
          </div>
        </div>

        {/* Raw Quote */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 relative">
          <MessageSquare className="absolute top-4 left-4 w-5 h-5 text-slate-300" />
          <p className="text-slate-600 text-sm italic pl-8 leading-relaxed">
            "{lead.raw_content}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => handleClaim('direct')}
            disabled={actionState !== 'idle'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-200 flex justify-center items-center gap-2"
          >
            {actionState === 'idle' && 'Claim Lead Instantly'}
            {actionState === 'claiming' && 'Securing Lead...'}
            {actionState === 'success' && <><Check className="w-5 h-5" /> Claimed Successfully</>}
          </button>
          
          {actionState === 'idle' && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleClaim('handoff')}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-slate-400" />
                Contact Handoff
              </button>
              <button 
                onClick={() => handleClaim('tour')}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
              >
                <Video className="w-4 h-4 text-slate-400" />
                Virtual Tour
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
