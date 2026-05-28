"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSpaceRequest } from "../actions";
import { Loader2, ArrowLeft, MapPin, DollarSign, Expand, Calendar } from "lucide-react";
import Link from "next/link";
import { PropertyType } from "@prisma/client";
import PredictiveAddressInput from "@/components/PredictiveAddressInput";
export default function NewSpaceRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    requiredType: "WAREHOUSE" as PropertyType,
    minSqft: "",
    maxBudget: "",
    durationMonths: "6",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createSpaceRequest({
      requiredType: formData.requiredType,
      minSqft: parseInt(formData.minSqft) || 0,
      maxBudget: parseFloat(formData.maxBudget) || 0,
      durationMonths: parseInt(formData.durationMonths) || 6,
      city: formData.city,
    });

    setLoading(false);

    if (result.success) {
      router.push("/dashboard/tenant/requests");
    } else {
      setError(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <Link href="/dashboard/tenant/requests" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a Space Request</h1>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
        <p className="text-gray-500 mt-1">Let owners know what you're looking for so they can reach out.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What type of space do you need?</label>
            <select 
              value={formData.requiredType}
              onChange={(e) => setFormData({...formData, requiredType: e.target.value as PropertyType})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
            >
              <option value="WAREHOUSE">Warehouse</option>
              <option value="FLEX">Flex Industrial</option>
              <option value="OFFICE">Office</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Expand className="w-4 h-4 text-gray-400" />
                Minimum Size (Sqft)
              </label>
              <input 
                type="number"
                required
                value={formData.minSqft}
                onChange={(e) => setFormData({...formData, minSqft: e.target.value})}
                placeholder="e.g. 5000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Max Monthly Budget
              </label>
              <input 
                type="number"
                required
                value={formData.maxBudget}
                onChange={(e) => setFormData({...formData, maxBudget: e.target.value})}
                placeholder="e.g. 3000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Target City / Area
              </label>
              <PredictiveAddressInput 
                initialValue={formData.city}
                onSelect={(address) => setFormData({...formData, city: address})}
                placeholder="e.g. Austin, TX"
                className="w-full pl-12 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
              />
              <input type="hidden" required value={formData.city} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Expected Duration (Months)
              </label>
              <input 
                type="number"
                required
                min="1"
                value={formData.durationMonths}
                onChange={(e) => setFormData({...formData, durationMonths: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link 
              href="/dashboard/tenant/requests"
              className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg font-medium bg-black text-white hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
