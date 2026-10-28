"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Triggers a global client-side sync event so all listening
 * views refresh immediately without waiting for the polling interval.
 */
export function triggerLiveSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("twc-live-sync"));
  }
}

/**
 * Smart live sync hook:
 * - Polls router.refresh() every `intervalMs` (default 4.5s) only when the tab is visible.
 * - Pauses immediately when the tab is backgrounded to save Vercel/Neon resources.
 * - Reacts immediately to manual `triggerLiveSync()` events.
 */
export function useLiveSync(intervalMs = 4500) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const refreshData = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        routerRef.current.refresh();
      }
    };

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(refreshData, intervalMs);
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshData();
        startTimer();
      } else {
        stopTimer();
      }
    };

    const handleCustomSync = () => {
      refreshData();
    };

    if (document.visibilityState === "visible") {
      startTimer();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("twc-live-sync", handleCustomSync);

    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("twc-live-sync", handleCustomSync);
    };
  }, [intervalMs]);
}
