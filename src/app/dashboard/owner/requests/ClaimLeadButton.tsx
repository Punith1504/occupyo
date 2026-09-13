"use client";

import { useState } from "react";
import { claimLead } from "./actions";

export function ClaimLeadButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClaim() {
    setLoading(true);
    const res = await claimLead(requestId);
    if (!res.success) {
      alert(res.error);
      setLoading(false);
    }
    // If success, the server action revalidates the path, so the UI will update
  }

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {loading ? "Claiming..." : "Claim Lead"}
    </button>
  );
}
