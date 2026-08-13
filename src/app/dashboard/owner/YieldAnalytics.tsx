"use client";

import { TrendingUp, Activity, DollarSign, PieChart, Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalyticsData } from "./analytics-actions";

export function YieldAnalytics({ data }: { data: AnalyticsData | null }) {
  if (!data) return null;

  const isEmpty = data.totalProperties === 0;

  if (isEmpty) {
    return (
      <div className="liquid-glass rounded-3xl p-8 mb-8 animate-fadeUp relative overflow-hidden">
        <div className="absolute inset-0 bg-[#b4e6ff] opacity-[0.02] mix-blend-screen" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#b4e6ff]" />
              Predictive Yield Analytics
            </h2>
            <p className="text-white/60 text-sm max-w-lg leading-relaxed">
              Unlock powerful business intelligence. Once you list your first flexible space, this dashboard will automatically generate Cap Rate estimates, Net Yield projections, and a 12-month revenue curve based on market heuristics.
            </p>
          </div>
          <div className="w-full md:w-1/3 flex gap-4 opacity-30 pointer-events-none grayscale">
            <div className="flex-1 bg-white/5 rounded-2xl h-24 border border-white/10 animate-pulse" />
            <div className="flex-1 bg-white/5 rounded-2xl h-24 border border-white/10 animate-pulse" style={{ animationDelay: "150ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-3xl p-6 md:p-8 mb-10 animate-fadeUp relative overflow-hidden shadow-2xl">
      {/* Soft Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#b4e6ff] opacity-10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#cbb4ff] opacity-10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#b4e6ff]" />
              Portfolio Intelligence
            </h2>
            <p className="text-white/50 text-sm mt-1">Real-time projections based on {data.totalSqft.toLocaleString()} sqft of managed space</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-[#b4e6ff] font-medium backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-[#b4e6ff] animate-pulse" />
            Live Market Sync
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Gross Revenue */}
          <div className="bg-[#0f172a]/40 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-medium">Projected Annual Gross</p>
              <DollarSign className="w-4 h-4 text-[#b4e6ff]" />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">
              ${(data.projectedAnnualRevenue / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4% vs Market Avg
            </p>
          </div>

          {/* Cap Rate */}
          <div className="bg-[#0f172a]/40 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-medium">Estimated Cap Rate</p>
              <PieChart className="w-4 h-4 text-[#cbb4ff]" />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">
              {data.capRate}%
            </p>
            <p className="text-xs text-white/40 mt-2">
              Based on ${data.estimatedAssetValue > 1000000 ? (data.estimatedAssetValue / 1000000).toFixed(1) + 'M' : (data.estimatedAssetValue / 1000).toFixed(0) + 'k'} valuation
            </p>
          </div>

          {/* Net Yield */}
          <div className="bg-[#0f172a]/40 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/60 text-sm font-medium">Gross Yield</p>
              <Activity className="w-4 h-4 text-[#a1ebd6]" />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">
              {data.netYield}%
            </p>
            <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" /> Before operating expenses
            </p>
          </div>
        </div>

        {/* 12-Month Area Chart */}
        <div className="h-[280px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.monthlyProjections} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b4e6ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#b4e6ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#b4e6ff', fontWeight: 'bold' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Projected Revenue']}
                labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="projectedRevenue" 
                stroke="#b4e6ff" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={2000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
