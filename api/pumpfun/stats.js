// Proxies pump.fun's (undocumented) holder-count endpoint and DexScreener's
// public market-cap endpoint so the browser can poll live $GOONIFY stats
// from cannabook's own origin without CORS or exposing rate limits.
const MINT = "FovbmorCWsm1PXxwvje7iSohTVRuM6WeqytknZpGpump";

async function fetchHolders() {
  const res = await fetch(
    `https://advanced-api-v2.pump.fun/coins/top-holders-and-sol-balance/${MINT}`,
    {
      headers: {
        accept: "application/json",
        "user-agent": "cannabook-stats",
        origin: "https://pump.fun",
        referer: "https://pump.fun/",
      },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.totalHolders === "number" ? data.totalHolders : null;
}

async function fetchMarketCap() {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${MINT}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const pair = Array.isArray(data.pairs) ? data.pairs[0] : null;
  const cap = pair?.marketCap ?? pair?.fdv;
  return typeof cap === "number" ? cap : null;
}

export default async function handler(req, res) {
  const [holders, marketCap] = await Promise.all([
    fetchHolders().catch(() => null),
    fetchMarketCap().catch(() => null),
  ]);

  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  res.status(200).json({ holders, marketCap });
}
