// Proxies pump.fun's live candle-relay endpoint (captured straight from the
// browser's network tab, since pump.fun's older documented API domains have
// moved/broken) so the browser can build a real market-cap chart from
// cannabook's own origin without CORS.
//
// pump.fun's candle close prices are already USD-per-token (verified against
// DexScreener/GeckoTerminal's market cap for this pool), so market cap is
// just close * total supply - standard pump.fun launches mint 1B tokens.
const TOTAL_SUPPLY = 1_000_000_000;

export default async function handler(req, res) {
  const { poolAddress, tokenAddress, resolution = "5", hours = "24" } = req.query;

  if (!poolAddress || !tokenAddress) {
    res.status(400).json({ error: "missing_params" });
    return;
  }

  const to = Math.floor(Date.now() / 1000);
  const from = to - Math.max(1, Number(hours) || 24) * 3600;

  try {
    const upstream = await fetch(
      `https://pump.fun/api/relay/rpc/tokens/candles?poolAddress=${encodeURIComponent(poolAddress)}&tokenAddress=${encodeURIComponent(tokenAddress)}&chain=solana&resolution=${encodeURIComponent(resolution)}&from=${from}&to=${to}&barCount=1000`,
      {
        headers: {
          accept: "application/json",
          "user-agent": "cannabook-chart",
          referer: `https://pump.fun/coin/${tokenAddress}`,
        },
      }
    );

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "upstream_error" });
      return;
    }

    const data = await upstream.json();
    const times = Array.isArray(data.t) ? data.t : [];
    const candles = times
      .map((time, i) => ({
        t: time * 1000,
        o: Number(data.o?.[i]) * TOTAL_SUPPLY,
        h: Number(data.h?.[i]) * TOTAL_SUPPLY,
        l: Number(data.l?.[i]) * TOTAL_SUPPLY,
        c: Number(data.c?.[i]) * TOTAL_SUPPLY,
        v: Number(data.volume?.[i]) || 0,
      }))
      .filter((candle) => Number.isFinite(candle.c) && candle.c > 0);

    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
    res.status(200).json({ candles });
  } catch (err) {
    res.status(502).json({ error: "fetch_failed" });
  }
}
