"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Cache buster for Turbopack
// 2026-07-27

export default function TelemetryTracker() {
  const pathname = usePathname();
  const { user } = useUser();

  useEffect(() => {
    // Use requestIdleCallback so telemetry never blocks UI rendering
    const track = () => {
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true, // survives page navigations
        body: JSON.stringify({
          userId: user?.id || "anonymous",
          eventType: "PAGE_VIEW",
          eventData: { path: pathname, timestamp: new Date().toISOString() },
        }),
      }).catch(() => {}); // silently fail
    };

    if ("requestIdleCallback" in window) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).requestIdleCallback(track);
    } else {
      setTimeout(track, 200);
    }
  }, [pathname, user]);

  return null;
}
