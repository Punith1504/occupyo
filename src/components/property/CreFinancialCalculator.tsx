"use client";

import { useState, useMemo } from "react";
import { 
  calculateNOI, 
  calculateCapRate, 
  calculateDebtService, 
  calculateCashOnCash, 
  calculateDCR, 
  generateProForma 
} from "@/lib/financials/cre-calculator";

interface CreFinancialCalculatorProps {
  defaultMonthlyRent: number;
  defaultCapRate?: number;
  defaultNoi?: number;
}

export default function CreFinancialCalculator({ 
  defaultMonthlyRent, 
  defaultCapRate, 
  defaultNoi 
}: CreFinancialCalculatorProps) {
  const annualRent = defaultMonthlyRent * 12;
  
  // Reverse-engineer purchase price if default Cap Rate exists, otherwise assume 6%
  const assumedCapRate = defaultCapRate ? (defaultCapRate / 100) : 0.06;
  const initialPurchasePrice = defaultNoi ? (defaultNoi / assumedCapRate) : (annualRent / assumedCapRate);

  const [purchasePrice, setPurchasePrice] = useState<number>(Math.round(initialPurchasePrice));
  const [downPaymentPct, setDownPaymentPct] = useState<number>(30); // 30% default
  const [interestRate, setInterestRate] = useState<number>(6.5); // 6.5% default
  const [amortization, setAmortization] = useState<number>(25); // 25 years
  const [vacancyRate, setVacancyRate] = useState<number>(5); // 5% default
  const [expenseRatio, setExpenseRatio] = useState<number>(35); // 35% default
  const [rentGrowth, setRentGrowth] = useState<number>(3); // 3% default

  const initialEquity = purchasePrice * (downPaymentPct / 100);
  const loanAmount = purchasePrice - initialEquity;
  const operatingExpenses = annualRent * (expenseRatio / 100);
  
  const noi = calculateNOI(annualRent, operatingExpenses, vacancyRate / 100);
  const capRate = calculateCapRate(noi, purchasePrice) * 100;
  const debtService = calculateDebtService(loanAmount, interestRate / 100, amortization);
  const cashOnCash = calculateCashOnCash(noi, debtService, initialEquity) * 100;
  const dcr = calculateDCR(noi, debtService);

  const proForma = useMemo(() => {
    return generateProForma(
      purchasePrice,
      annualRent,
      operatingExpenses,
      vacancyRate / 100,
      rentGrowth / 100,
      (rentGrowth - 1) / 100, // Expense growth typically slightly lags rent
      debtService,
      5
    );
  }, [purchasePrice, annualRent, operatingExpenses, vacancyRate, rentGrowth, debtService]);

  return (
    <div className="skeuo-card rounded-2xl overflow-hidden mt-10">
      <div className="bg-[#1e2532] border-b border-white/5 px-6 py-5">
        <h3 className="text-xl font-bold text-gray-900">Interactive Pro-Forma Engine</h3>
        <p className="text-sm text-gray-400 mt-1">Adjust the mechanical assumptions below to dynamically project your investment returns.</p>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Hardware Assumptions</h4>
          
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-300 mb-3">
              <span>Estimated Purchase Price</span>
              <span className="font-bold text-teal-700">${purchasePrice.toLocaleString()}</span>
            </label>
            <input 
              type="range" 
              min={initialPurchasePrice * 0.5} 
              max={initialPurchasePrice * 2} 
              step={10000}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="skeuo-slider"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-300 mb-3">
              <span>Down Payment (%)</span>
              <span className="font-bold text-teal-700">{downPaymentPct}%</span>
            </label>
            <input 
              type="range" 
              min={10} 
              max={100} 
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="skeuo-slider"
            />
            <p className="text-xs text-gray-500 mt-2 font-mono">Equity: ${(purchasePrice * (downPaymentPct/100)).toLocaleString()}</p>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-300 mb-3">
              <span>Interest Rate (%)</span>
              <span className="font-bold text-[#f59e0b]">{interestRate.toFixed(1)}%</span>
            </label>
            <input 
              type="range" 
              min={3} 
              max={12} 
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="skeuo-slider"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-300 mb-3">
              <span>Operating Expense Ratio (%)</span>
              <span className="font-bold text-[#f59e0b]">{expenseRatio}%</span>
            </label>
            <input 
              type="range" 
              min={10} 
              max={60} 
              step={1}
              value={expenseRatio}
              onChange={(e) => setExpenseRatio(Number(e.target.value))}
              className="skeuo-slider"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Telemetry (Year 1)</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Cap Rate</p>
              <p className="text-2xl font-bold skeuo-led-emerald px-2 py-1 rounded text-center">{capRate.toFixed(2)}%</p>
            </div>
            
            <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Cash-on-Cash</p>
              <p className="text-2xl font-bold skeuo-led-emerald px-2 py-1 rounded text-center">{cashOnCash.toFixed(2)}%</p>
            </div>

            <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">NOI</p>
              <p className="text-xl font-bold skeuo-led-emerald px-2 py-2 rounded text-center">${Math.round(noi).toLocaleString()}</p>
            </div>

            <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 shadow-inner">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">DSCR</p>
              <p className={`text-xl font-bold px-2 py-2 rounded text-center ${dcr < 1.2 ? 'skeuo-led-amber' : 'skeuo-led-emerald'}`}>{dcr > 0 ? dcr.toFixed(2) : 'N/A'}x</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 mt-6">
          <h4 className="font-semibold text-gray-900 mb-4">5-Year Pro Forma Projection</h4>
          <div className="skeuo-paper p-4 md:p-6 rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap font-mono">
              <thead>
                <tr className="text-gray-500 border-b border-gray-300">
                  <th className="font-medium py-3 pr-4">Line Item</th>
                  {proForma.map(yr => <th key={yr.year} className="font-medium py-3 px-4 text-right">Year {yr.year}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 pr-4 text-gray-800">Effective Gross Revenue</td>
                  {proForma.map(yr => <td key={yr.year} className="py-3 px-4 text-right text-gray-800">${Math.round(yr.grossRevenue).toLocaleString()}</td>)}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-gray-800">Operating Expenses</td>
                  {proForma.map(yr => <td key={yr.year} className="py-3 px-4 text-right text-red-700">-${Math.round(yr.operatingExpenses).toLocaleString()}</td>)}
                </tr>
                <tr className="font-semibold bg-gray-200/50">
                  <td className="py-3 pr-4 text-gray-900 border-y border-gray-300">Net Operating Income</td>
                  {proForma.map(yr => <td key={yr.year} className="py-3 px-4 text-right text-gray-900 border-y border-gray-300">${Math.round(yr.noi).toLocaleString()}</td>)}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-gray-800">Debt Service</td>
                  {proForma.map(yr => <td key={yr.year} className="py-3 px-4 text-right text-red-700">-${Math.round(yr.debtService).toLocaleString()}</td>)}
                </tr>
                <tr className="font-bold border-t-2 border-gray-400">
                  <td className="py-3 pr-4 text-gray-900">Net Cash Flow</td>
                  {proForma.map(yr => <td key={yr.year} className={`py-3 px-4 text-right ${yr.netCashFlow > 0 ? 'text-green-700' : 'text-red-700'}`}>${Math.round(yr.netCashFlow).toLocaleString()}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
