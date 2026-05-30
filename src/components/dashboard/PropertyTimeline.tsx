"use client";

import { CheckCircle2, DollarSign, Clock, Building, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: Date;
  propertyId?: string | null;
}

const getIconForType = (type: string) => {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return <DollarSign className="w-4 h-4 text-[#a1ebd6]" />;
    case "PROPERTY_CREATED":
      return <Building className="w-4 h-4 text-[#b4e6ff]" />;
    case "LEASE_APPROVED":
      return <CheckCircle2 className="w-4 h-4 text-[#cbb4ff]" />;
    default:
      return <Clock className="w-4 h-4 text-white/50" />;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return "bg-[#a1ebd6]/20 border-[#a1ebd6]/30";
    case "PROPERTY_CREATED":
      return "bg-[#b4e6ff]/20 border-[#b4e6ff]/30";
    case "LEASE_APPROVED":
      return "bg-[#cbb4ff]/20 border-[#cbb4ff]/30";
    default:
      return "bg-white/10 border-white/20";
  }
};

export function PropertyTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="glass-card p-8 mt-8 flex flex-col items-center justify-center min-h-[300px] text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-[#b4e6ff] opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700" />
        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center border border-white/10 mb-4">
          <Clock className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Recent Activity</h3>
        <p className="text-white/50 text-sm max-w-sm mb-6">
          Your timeline is quiet. Once you list a property or receive a booking, your transaction history will appear here.
        </p>
        <Link href="/dashboard/owner/listings/create" className="text-[#b4e6ff] text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
          Create your first listing <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 animate-fadeUp" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#b4e6ff]" />
          Activity Log
        </h2>
        <span className="text-xs font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10 text-white/60">
          Last 30 Days
        </span>
      </div>

      <div className="glass-card p-6 md:p-8 relative">
        {/* Vertical Line */}
        <div className="absolute left-[39px] md:left-[47px] top-8 bottom-8 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

        <div className="space-y-8 relative z-10">
          {events.map((event, idx) => (
            <div 
              key={event.id} 
              className="flex gap-4 md:gap-6 group animate-fadeUp"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon Node */}
              <div className="relative shrink-0 mt-1">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border flex items-center justify-center shadow-lg backdrop-blur-md transition-transform group-hover:scale-110 ${getColorForType(event.type)}`}>
                  {getIconForType(event.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1 gap-1">
                  <h4 className="text-white font-semibold text-base">{event.title}</h4>
                  <span className="text-white/40 text-xs shrink-0 mt-0.5 whitespace-nowrap">
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-3">
                  {event.description}
                </p>
                {event.propertyId && (
                  <Link 
                    href={`/dashboard/owner/listings/${event.propertyId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#b4e6ff] hover:text-white transition-colors"
                  >
                    View Property <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
