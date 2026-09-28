import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 30000;

const DEFAULT_STATS = {
  holders: null,
  snipers: null,
  bundlers: null,
  devHolding: null,
  marketCap: null,
  athMarketCap: null,
  trades24h: null,
  priceChangeH24: null,
  pairAddress: null,
  chainId: null,
};

// Polls cannabook's own /api/pumpfun/stats proxy for live $GOONIFY stats
// (holders, sniper/bundler breakdown, dev-holding flag, market cap and
// all-time-high market cap from pump.fun; 24h trades, 24h price change and
// the DexScreener pair id for the chart, from DexScreener).
export function usePumpfunStats() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/pumpfun/stats");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelledRef.current) return;
        setStats({ ...DEFAULT_STATS, ...data });
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
