"use client";

import React from "react";
import { Building2, X } from "lucide-react";

const PROPERTY_TYPES = [
  "ALL",
  "WAREHOUSE",
  "OFFICE",
  "FLEX",
  "RETAIL",
  "INDUSTRIAL",
  "STORAGE",
] as const;

interface SearchFiltersProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  priceRange: { min: string; max: string };
  onPriceChange: (range: { min: string; max: string }) => void;
  sizeRange: { min: string; max: string };
  onSizeChange: (range: { min: string; max: string }) => void;
  resultCount: number;
  onReset: () => void;
}

export default function SearchFilters({
  activeType,
  onTypeChange,
  priceRange,
  onPriceChange,
  sizeRange,
  onSizeChange,
  resultCount,
  onReset,
}: SearchFiltersProps) {
  const hasFilters =
    activeType !== "ALL" ||
    priceRange.min ||
    priceRange.max ||
    sizeRange.min ||
    sizeRange.max;

  return (
    <div className="space-y-4">
      {/* Property Type Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {PROPERTY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeType === type
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            {type === "ALL" ? "All Types" : type}
          </button>
        ))}
      </div>

      {/* Range Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Price range */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Price/mo
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) =>
                onPriceChange({ ...priceRange, min: e.target.value })
              }
              className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
            />
            <span className="text-slate-300">–</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) =>
                onPriceChange({ ...priceRange, max: e.target.value })
              }
              className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
            />
          </div>
        </div>

        {/* Size range */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
            Size (sqft)
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Min"
              value={sizeRange.min}
              onChange={(e) =>
                onSizeChange({ ...sizeRange, min: e.target.value })
              }
              className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
            />
            <span className="text-slate-300">–</span>
            <input
              type="number"
              placeholder="Max"
              value={sizeRange.max}
              onChange={(e) =>
                onSizeChange({ ...sizeRange, max: e.target.value })
              }
              className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
            />
          </div>
        </div>

        {/* Result count + reset */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{resultCount}</span>{" "}
            {resultCount === 1 ? "result" : "results"}
          </span>
          {hasFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
