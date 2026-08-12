"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Loader2, Bot, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AiMatcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    vibe: "",
    budget: "",
    size: ""
  });

  const handleNext = () => {
    if (step === 2) {
      setLoading(true);
      // Simulate AI searching delay
      setTimeout(() => {
        setLoading(false);
        setStep(3); // Results step
      }, 2000);
    } else {
      setStep(prev => prev + 1);
    }
  };

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl p-6 text-gray-900 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100/50 rounded-full flex items-center justify-center backdrop-blur-md">
              <Bot className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">AI Space Matcher</h3>
              <p className="text-gray-500 text-sm">Find your perfect space in 30 seconds</p>
            </div>
          </div>
          <div className="bg-white text-indigo-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 group-hover:bg-indigo-50 transition-colors">
            Start <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-6 flex justify-between items-center text-gray-900">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-lg">Occupyo AI</h3>
        </div>
        <button onClick={() => { setIsOpen(false); setStep(0); }} className="text-gray-400 hover:text-gray-900">
          Close
        </button>
      </div>

      <div className="p-6 md:p-8 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 rounded-full"></div>
              <Loader2 className="w-12 h-12 text-cyan-600 animate-spin relative z-10" />
            </div>
            <p className="text-gray-600 font-medium">Analyzing market availability...</p>
            <p className="text-sm text-gray-400">Matching your exact preferences.</p>
          </div>
        ) : step === 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
            <h4 className="text-2xl font-bold text-gray-900">What's your primary use case?</h4>
            <div className="grid grid-cols-2 gap-4">
              {['Creative Studio', 'Tech Startup', 'Heavy Industrial', 'Medical/Wellness'].map(vibe => (
                <button 
                  key={vibe}
                  onClick={() => { setPreferences({...preferences, vibe}); handleNext(); }}
                  className="p-4 border border-gray-200 rounded-xl text-left hover:border-black hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span className="block font-medium text-gray-900">{vibe}</span>
                </button>
              ))}
            </div>
          </div>
        ) : step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
            <h4 className="text-2xl font-bold text-gray-900">What's your monthly budget?</h4>
            <div className="space-y-3">
              {['Under $2,500', '$2,500 - $5,000', '$5,000 - $10,000', '$10,000+'].map(budget => (
                <button 
                  key={budget}
                  onClick={() => { setPreferences({...preferences, budget}); handleNext(); }}
                  className="w-full p-4 border border-gray-200 rounded-xl text-left hover:border-black hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{budget}</span>
                </button>
              ))}
            </div>
          </div>
        ) : step === 2 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h4 className="text-2xl font-bold text-gray-900">How much space do you need?</h4>
            <div className="grid grid-cols-2 gap-4">
              {['< 1,000 sqft', '1,000 - 3,000 sqft', '3,000 - 10,000 sqft', '10,000+ sqft'].map(size => (
                <button 
                  key={size}
                  onClick={() => { setPreferences({...preferences, size}); handleNext(); }}
                  className="p-4 border border-gray-200 rounded-xl text-center hover:border-black hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{size}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 text-green-600 mb-6">
              <CheckCircle2 className="w-8 h-8" />
              <h4 className="text-2xl font-bold text-gray-900">Found 3 Matches!</h4>
            </div>
            
            <p className="text-gray-600">Based on your need for a <strong className="text-black">{preferences.vibe}</strong> space under <strong className="text-black">{preferences.budget}</strong>.</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Premium Flex Loft</p>
                  <p className="text-sm text-gray-500">98% Match • Downtown</p>
                </div>
              </div>
              <button 
                onClick={() => router.push("/dashboard/tenant?filter=ai-matched")}
                className="text-indigo-600 font-semibold text-sm hover:underline"
              >
                View
              </button>
            </div>
            
            <button 
              onClick={() => router.push("/dashboard/tenant?filter=ai-matched")}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              See All Matches
            </button>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {step < 3 && !loading && (
        <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
          <div 
            className="h-full bg-cyan-500 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
