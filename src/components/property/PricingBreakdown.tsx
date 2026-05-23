import { Check, Info } from "lucide-react";

interface PricingBreakdownProps {
  baseRent: number;
}

export function PricingBreakdown({ baseRent }: PricingBreakdownProps) {
  // Mock data for breakdown - in a real app, these would come from the property model
  const maintenanceFee = Math.round(baseRent * 0.05); // 5% of base rent
  const utilitiesEstimate = Math.round(baseRent * 0.03); // 3% of base rent
  const totalMonthly = baseRent + maintenanceFee + utilitiesEstimate;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-8">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Transparent Pricing Breakdown</h3>
        <p className="text-sm text-gray-500 mt-1">No hidden fees. Exactly what you'll pay each month.</p>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Base Rent */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Base Rent</span>
          </div>
          <span className="font-medium text-gray-900">${baseRent.toLocaleString()}/mo</span>
        </div>

        {/* Maintenance */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 group relative">
            <span className="text-gray-600">Building Maintenance</span>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
              Covers common area cleaning, security, and structural upkeep.
            </div>
          </div>
          <span className="text-gray-600">${maintenanceFee.toLocaleString()}/mo</span>
        </div>

        {/* Utilities */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 group relative">
            <span className="text-gray-600">Est. Utilities (Water & Trash)</span>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
              Estimated average based on building history. Electricity billed separately.
            </div>
          </div>
          <span className="text-gray-600">${utilitiesEstimate.toLocaleString()}/mo</span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-gray-900">Total Monthly Cost</span>
          <span className="text-xl font-bold text-black">${totalMonthly.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4 bg-green-50 border-t border-green-100 flex items-start gap-3">
        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-green-800 font-medium leading-relaxed">
          Occupyo Guarantee: The price you see is the price you pay. We aggressively audit our listings to ban hidden landlord fees.
        </p>
      </div>
    </div>
  );
}
