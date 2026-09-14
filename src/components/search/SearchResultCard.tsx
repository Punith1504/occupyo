"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Ruler,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Globe,
  ArrowRight,
} from "lucide-react";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  propertyType: string;
  address?: string;
  sizeSqft?: number;
  pricePerMonth?: number;
  pricePerHour?: number;
  pricePerDay?: number;
  isExternal?: boolean;
  sourceUrl?: string;
  similarity: number;
  images?: { url: string; isHero?: boolean }[];
  lat?: number;
  lng?: number;
}

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
}

export default function SearchResultCard({
  result,
  index,
  isHighlighted,
  onHover,
}: SearchResultCardProps) {
  const matchPercent = Math.round(result.similarity * 100);
  const heroImage = result.images?.find((img) => img.isHero) || result.images?.[0];
  const price =
    result.pricePerMonth || result.pricePerDay || result.pricePerHour;
  const priceLabel = result.pricePerMonth
    ? "/mo"
    : result.pricePerDay
    ? "/day"
    : result.pricePerHour
    ? "/hr"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      onMouseEnter={() => onHover?.(result.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer ${
        isHighlighted
          ? "border-indigo-300 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200/50"
          : "border-slate-200/70 shadow-sm hover:shadow-md hover:border-indigo-200/60"
      }`}
    >
      {/* Image Section */}
      {heroImage && (
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={heroImage.url}
            alt={result.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {result.isExternal ? (
              <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                <Globe className="w-3 h-3" />
                Web Result
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* Match Score */}
          <div className="absolute top-3 right-3">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke={matchPercent >= 80 ? "#34d399" : matchPercent >= 60 ? "#fbbf24" : "#94a3b8"}
                  strokeWidth="2.5"
                  strokeDasharray={`${matchPercent} ${100 - matchPercent}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-md">
                  {matchPercent}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* No image fallback badge */}
        {!heroImage && (
          <div className="flex items-center gap-2 mb-3">
            {result.isExternal ? (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 uppercase tracking-wider">
                <Globe className="w-3 h-3" />
                Web Result
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
            {!heroImage && (
              <div className="ml-auto relative w-10 h-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.9155" fill="none"
                    stroke={matchPercent >= 80 ? "#34d399" : matchPercent >= 60 ? "#fbbf24" : "#94a3b8"}
                    strokeWidth="2.5"
                    strokeDasharray={`${matchPercent} ${100 - matchPercent}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-600">{matchPercent}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2 line-clamp-1">
          {result.title}
        </h3>

        {result.description && (
          <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-2">
            {result.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {result.propertyType}
          </div>
          {result.address && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[160px]">{result.address}</span>
            </div>
          )}
          {result.sizeSqft && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-slate-400" />
              {result.sizeSqft.toLocaleString()} sqft
            </div>
          )}
        </div>

        {/* Footer: Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {price ? (
            <div className="flex items-baseline gap-1">
              <DollarSign className="w-4 h-4 text-indigo-500" />
              <span className="text-xl font-bold text-slate-900">
                {price.toLocaleString()}
              </span>
              <span className="text-sm text-slate-400">{priceLabel}</span>
            </div>
          ) : (
            <span className="text-sm text-slate-400">Contact for pricing</span>
          )}

          {result.isExternal && result.sourceUrl ? (
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View Source
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors group/btn">
              Contact Broker
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
