"use client";

import { useState } from "react";
import { updateLeaseStatus } from "./actions";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function LeaseActionButtons({ leaseId }: { leaseId: string }) {
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setLoading(status);
    await updateLeaseStatus(leaseId, status);
    setLoading(null);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("APPROVED")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading === "APPROVED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Approve
      </button>
      <button
        onClick={() => handleAction("REJECTED")}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading === "REJECTED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        Reject
      </button>
    </div>
  );
}
