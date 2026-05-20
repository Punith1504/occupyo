"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function TelemetryTracker() {
  const pathname = usePathname();
  const { user } = useUser();

  useEffect(() => {
    // Track page views
    const trackPageView = async () => {
      try {
        await fetch("/api/telemetry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.id || "anonymous",
            eventType: "PAGE_VIEW",
            eventData: { path: pathname, timestamp: new Date().toISOString() },
          }),
        });
      } catch (err) {
        // Silently fail for telemetry
      }
    };

    trackPageView();
  }, [pathname, user]);

  return null;
}
