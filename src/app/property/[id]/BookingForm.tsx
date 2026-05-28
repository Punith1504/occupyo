"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLeaseRequest } from "./actions";
import { Loader2 } from "lucide-react";

interface BookingFormProps {
  propertyId: string;
  pricePerMonth: number;
  minDuration: number;
  maxDuration: number;
  durationUnit: string;
  pricePerHour: number | null;
  pricePerDay: number | null;
  ownerName: string;
  ownerId: string;
}

export function BookingForm({
  propertyId,
  pricePerMonth,
  minDuration,
  maxDuration,
  durationUnit,
  pricePerHour,
  pricePerDay,
  ownerName,
  ownerId,
}: BookingFormProps) {
  const router = useRouter();
  const [duration, setDuration] = useState<number>(minDuration);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  let unitPrice = pricePerMonth;
  let unitLabel = "month";
  if (durationUnit === "HOURS" && pricePerHour) {
    unitPrice = pricePerHour;
    unitLabel = "hour";
  } else if (durationUnit === "DAYS" && pricePerDay) {
    unitPrice = pricePerDay;
    unitLabel = "day";
  }

  const totalAmount = unitPrice * duration;

  const handleBooking = async () => {
    setLoading(true);
    setError("");
    
    const result = await createLeaseRequest({
      propertyId,
      duration: duration,
      durationUnit: durationUnit,
      bookingType: durationUnit === "HOURS" ? "HOURLY" : (durationUnit === "DAYS" ? "DAILY" : "MONTHLY")
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      // Optional: Wait a moment then redirect to tenant dashboard
      setTimeout(() => {
        router.push("/dashboard/tenant/leases");
      }, 2000);
    } else {
      setError(result.error || "Failed to process booking request.");
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-green-200 shadow-xl sticky top-24 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
        <p className="text-gray-600 mb-6">The owner will review your request shortly. You will be redirected to your dashboard.</p>
        <button 
          onClick={() => router.push("/dashboard/tenant")}
          className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xl sticky top-24">
      <div className="mb-6">
        <span className="text-2xl md:text-3xl font-bold text-gray-900">${unitPrice.toLocaleString()}</span>
        <span className="text-gray-500 text-sm md:text-base"> / {unitLabel}</span>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100">
          {error}
        </div>
      )}
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Available from</span>
          <span className="font-medium text-gray-900">Immediately</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Listed by</span>
          <span className="font-medium text-gray-900">{ownerName}</span>
        </div>
      </div>

      <div className="mb-6 border-t border-gray-100 pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Lease Duration ({durationUnit})</label>
        <div className="flex items-center">
          <input 
            type="range" 
            min={minDuration} 
            max={maxDuration} 
            value={duration} 
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full accent-black"
          />
          <span className="ml-4 w-12 text-center font-bold text-gray-900">{duration}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Min: {minDuration}</span>
          <span>Max: {maxDuration}</span>
        </div>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-xl">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Rate ({unitLabel})</span>
          <span className="font-medium text-gray-900">${unitPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium text-gray-900">{duration} {unitLabel}s</span>
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
          <span className="text-gray-900">Total Commitment</span>
          <span className="text-gray-900">${totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-black text-white py-3.5 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Processing..." : "Request to Book"}
        </button>

        <button 
          onClick={() => router.push(`/dashboard/messages/${ownerId}`)}
          className="w-full bg-white text-gray-900 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          Message Owner
        </button>
      </div>
      
      <p className="text-center text-xs text-gray-500 mt-4">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
        You won't be charged yet. The owner must approve your request first.
      </p>
    </div>
  );
}
