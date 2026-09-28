import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 30000;

// Polls cannabook's own /api/pumpfun/stats proxy for live $GOONIFY holder
// count and market cap (sourced from pump.fun and DexScreener respectively).
export function usePumpfunStats() {
  const [stats, setStats] = useState({ holders: null, marketCap: null });
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/pumpfun/stats");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelledRef.current) return;
        setStats({ holders: data.holders ?? null, marketCap: data.marketCap ?? null });
      } catch {
        // transient network/API failure - keep the last known values and retry next tick
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, []);

  return stats;
}
