'use client';
import React, { useState, useEffect } from 'react';

// A beautifully crafted, premium Liquid Glass Quant Dashboard UI
export default function QuantDashboard() {
  const [ticker, setTicker] = useState('RELIANCE.NS');
  const [isSearching, setIsSearching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  // Simulate fetching data and evaluating metrics
  useEffect(() => {
    if (!ticker) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSearching(true);
    
    // Simulating API calculation delay for TA Engine
    const timer = setTimeout(() => {
      const isBullish = ticker.length % 2 === 0;
      const basePrice = Math.random() * 2000 + 100;
      const change1D = (Math.random() * 4 * (isBullish ? 1 : -1));
      const change1W = (Math.random() * 10 * (isBullish ? 1 : -1));
      
      const rsi = (Math.random() * 60 + 20).toFixed(2);
      const isRSIOverbought = Number(rsi) > 70;
      const isRSIOversold = Number(rsi) < 30;
      const macd = (Math.random() * 5 * (isBullish ? 1 : -1)).toFixed(2);
      
      setData({
        price: basePrice.toFixed(2),
        change1D: change1D,
        change1W: change1W,
        metrics: [
          {
            name: "RSI (14)",
            value: rsi,
            signal: isRSIOverbought ? "Overbought (Bearish)" : isRSIOversold ? "Oversold (Bullish)" : "Neutral",
            signalColor: isRSIOverbought ? "text-red-400" : isRSIOversold ? "text-green-400" : "text-gray-400",
            rule: "Measures momentum. >70 is typically Overbought (price may fall), <30 is Oversold (price may rise)."
          },
          {
            name: "MACD (12, 26)",
            value: macd,
            signal: Number(macd) > 0 ? "Bullish Crossover" : "Bearish Crossover",
            signalColor: Number(macd) > 0 ? "text-green-400" : "text-red-400",
            rule: "Trend-following momentum. MACD line crossing above Signal line is Bullish. Crossing below is Bearish."
          },
          {
            name: "Bollinger Bands",
            value: "Within Bands",
            signal: "Neutral Consolidation",
            signalColor: "text-gray-400",
            rule: "Measures volatility and overbought/oversold levels. Price bouncing off lower band is bullish; touching upper band is bearish."
          },
          {
            name: "EMA Crossover",
            value: `20 EMA > 50 EMA`,
            signal: isBullish ? "Bullish Trend" : "Bearish Trend",
            signalColor: isBullish ? "text-green-400" : "text-red-400",
            rule: "Short-term EMA (20) > Long-term EMA (50) implies upward momentum. The reverse implies downward trend."
          }
        ]
      });
      setIsSearching(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [ticker]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-slate-200 font-sans p-6">
      
      {/* CSS For Glassmorphism and Marquee injected directly */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 25s linear infinite; }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
      `}} />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
              Premium Quant Engine
            </h1>
            <p className="text-slate-400">Real-time Technical Analysis & Market Evaluation Matrix</p>
          </div>
          <div className="w-full md:w-auto relative">
            <input 
              type="text" 
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full md:w-80 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all uppercase placeholder-slate-500"
              placeholder="ENTER TICKER (e.g. RELIANCE.NS)"
            />
            {isSearching && (
              <div className="absolute right-4 top-3.5 w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>

        {/* Scrolling Performance Marquee */}
        {data && (
          <div className="w-full overflow-hidden bg-slate-900/60 backdrop-blur-md py-4 rounded-xl border border-white/5">
            <div className="animate-marquee flex gap-12 text-sm font-semibold tracking-wider">
              <span className="text-gray-900">TICKER: <span className="text-cyan-400">{ticker}</span></span>
              <span className="text-gray-900">PRICE: <span className="text-cyan-400">₹{data.price}</span></span>
              <span className="text-gray-900">1D CHANGE: <span className={data.change1D >= 0 ? "text-green-400" : "text-red-400"}>{data.change1D >= 0 ? '+' : ''}{data.change1D.toFixed(2)}%</span></span>
              <span className="text-gray-900">1W CHANGE: <span className={data.change1W >= 0 ? "text-green-400" : "text-red-400"}>{data.change1W >= 0 ? '+' : ''}{data.change1W.toFixed(2)}%</span></span>
              <span className="text-gray-900">RSI (14): <span className="text-purple-400">{data.metrics[0].value}</span></span>
              <span className="text-gray-900">TREND: <span className="text-pink-400">{data.metrics[3].signal}</span></span>
            </div>
          </div>
        )}

        {/* Charting Widget (TradingView Embed via iframe for zero-dependency premium charting) */}
        <div className="w-full h-[500px] glass-card rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-slate-900/50 flex items-center justify-center -z-10">
                <span className="text-slate-500 font-medium">Loading Advanced Chart...</span>
            </div>
            {/* We dynamically construct the symbol for TradingView */}
            <iframe 
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=${ticker.replace('.NS', '').replace('.BO', '')}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FKolkata&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`}
                width="100%" height="100%" frameBorder="0" allowTransparency scrolling="no" className="z-10 relative"
            ></iframe>
        </div>

        {/* Technical Evaluation Matrix */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">Technical Evaluation Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.metrics.map((metric: { name: string, value: string, signal: string, signalColor: string, rule: string }, idx: number) => (
              <div key={idx} className="glass-card rounded-2xl p-6 transition-transform hover:-translate-y-1 duration-300">
                <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-widest mb-2">{metric.name}</h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-4">{metric.value}</div>
                
                <div className="mb-4">
                  <span className="text-slate-400 text-sm">Engine Signal: </span>
                  <span className={`font-semibold ${metric.signalColor}`}>{metric.signal}</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <span className="text-slate-300 text-sm font-semibold">Evaluation Logic:</span>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{metric.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
