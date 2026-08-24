"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ingestLead } from '@/lib/api/occupyo';
import { Loader2, CheckCircle2, Send, X } from 'lucide-react';

interface DemandIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemandIntakeModal({ isOpen, onClose }: DemandIntakeModalProps) {
  const [modalInput, setModalInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleIngestSubmit = async () => {
    if (!modalInput.trim()) return;
    
    setStatus('processing');
    setErrorMessage('');
    
    const res = await ingestLead({ source: 'frontend_modal', content: modalInput });
    
    if (res.error || !res.data) {
      setStatus('error');
      setErrorMessage(res.error || 'Something went wrong.');
      return;
    }

    if (res.data.status === 'accepted') {
      setStatus('success');
      setTimeout(() => {
        onClose();
        // Reset state after closing animation
        setTimeout(() => {
          setStatus('idle');
          setModalInput('');
        }, 300);
      }, 2500);
    } else {
      setStatus('error');
      setErrorMessage(res.data.message || 'Submission rejected.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            onClick={status !== 'processing' ? onClose : undefined}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-2xl z-50"
          >
            <button 
              onClick={onClose}
              disabled={status === 'processing'}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Submit Requirements</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Paste your exact requirements, email snippet, or notes. Our AI will extract the intent and notify matching verified brokers instantly.
            </p>
            
            <textarea
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              disabled={status === 'processing' || status === 'success'}
              placeholder="e.g. Need 8,000 sqft warehouse in East Austin with high dock access by Q4. Budget is around $15/sqft."
              className="w-full h-40 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-4 text-slate-700 disabled:opacity-50 transition-all"
            />
            
            {status === 'error' && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {errorMessage}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                {status === 'processing' && (
                  <span className="flex items-center gap-2 text-indigo-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting semantics & matching...
                  </span>
                )}
                {status === 'success' && (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Request structured & brokers alerted!
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  disabled={status === 'processing'}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleIngestSubmit}
                  disabled={status === 'processing' || status === 'success' || !modalInput.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-slate-200"
                >
                  {status === 'processing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {status === 'success' ? 'Submitted' : 'Submit to Brokers'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
