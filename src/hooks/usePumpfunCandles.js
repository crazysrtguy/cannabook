import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 30000;

// Polls cannabook's own /api/pumpfun/candles proxy for live $GOONIFY
// market-cap candles (sourced from pump.fun's candle relay).
export function usePumpfunCandles(poolAddress, tokenAddress, resolution, hours) {
  const [candles, setCandles] = useState([]);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!poolAddress || !tokenAddress) return undefined;
    cancelledRef.current = false;

    const poll = async () => {
      try {
        const params = new URLSearchParams({
          poolAddress,
          tokenAddress,
          resolution: String(resolution),
          hours: String(hours),
        });
        const res = await fetch(`/api/pumpfun/candles?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelledRef.current) return;
        setCandles(Array.isArray(data.candles) ? data.candles : []);
      } catch {
        // transient network/API failure - keep the last known candles and retry next tick
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [poolAddress, tokenAddress, resolution, hours]);

  return candles;
}
