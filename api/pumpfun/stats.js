// Proxies pump.fun's (undocumented) holder endpoint and DexScreener's public
// token endpoint so the browser can poll live $GOONIFY stats from
// cannabook's own origin without CORS or exposing rate limits.
//
// pump.fun's API surface moved recently - most frontend-api-v3.pump.fun
// and advanced-api-v2.pump.fun routes now 404/error for unauthenticated
// requests. The one route below (top-holders-and-sol-balance) is the only
// one confirmed still working without a session token, so it's used both
// for the holder total and, from the same payload, a sniper/bundler
// breakdown pump.fun tags on each holder. Everything else real-time
// (trade count, price change, chart) comes from DexScreener, which mirrors
// the same pump.fun bonding-curve pool.
const MINT = "FovbmorCWsm1PXxwvje7iSohTVRuM6WeqytknZpGpump";

const HOLDER_DEFAULTS = { holders: null, snipers: null, bundlers: null, devHolding: null };
const MARKET_DEFAULTS = {
  marketCap: null,
  trades24h: null,
  priceChangeH24: null,
  pairAddress: null,
  chainId: null,
};

async function fetchHolderStats() {
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
  if (!res.ok) return HOLDER_DEFAULTS;
  const data = await res.json();
  const topHolders = Array.isArray(data.topHolders) ? data.topHolders : [];
  return {
    holders: typeof data.totalHolders === "number" ? data.totalHolders : null,
    snipers: topHolders.filter((h) => h.isSniper).length,
    bundlers: topHolders.filter((h) => h.isBundler).length,
    devHolding: topHolders.some((h) => h.isDev),
  };
}

async function fetchMarketStats() {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${MINT}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return MARKET_DEFAULTS;
  const data = await res.json();
  const pair = Array.isArray(data.pairs) ? data.pairs[0] : null;
  if (!pair) return MARKET_DEFAULTS;
  const cap = pair.marketCap ?? pair.fdv;
  const h24 = pair.txns?.h24;
  return {
    marketCap: typeof cap === "number" ? cap : null,
    trades24h: h24 ? h24.buys + h24.sells : null,
    priceChangeH24:
      typeof pair.priceChange?.h24 === "number" ? pair.priceChange.h24 : null,
    pairAddress: pair.pairAddress ?? null,
    chainId: pair.chainId ?? null,
  };
}

export default async function handler(req, res) {
  const [holderStats, marketStats] = await Promise.all([
    fetchHolderStats().catch(() => HOLDER_DEFAULTS),
    fetchMarketStats().catch(() => MARKET_DEFAULTS),
  ]);

  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
  res.status(200).json({ ...holderStats, ...marketStats });
}
