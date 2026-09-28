// Proxies pump.fun's (undocumented) holder endpoints and DexScreener's public
// token endpoint so the browser can poll live $GOONIFY stats from
// cannabook's own origin without CORS or exposing rate limits.
//
// pump.fun's API surface moved recently - most frontend-api-v3.pump.fun and
// advanced-api-v2.pump.fun routes now 404/error for unauthenticated requests.
// token-holders/{mint}/count is the dedicated, authoritative holder-count
// endpoint (captured straight from the browser's network tab); the
// top-holders-and-sol-balance endpoint is kept only for its per-holder
// sniper/bundler/dev tags, with its own totalHolders as a fallback if the
// count endpoint ever fails. Everything else real-time (trade count, price
// change, chart) comes from DexScreener, which mirrors the same pump.fun
// bonding-curve pool.
const MINT = "FovbmorCWsm1PXxwvje7iSohTVRuM6WeqytknZpGpump";
// CAIP-2 id for Solana mainnet, as returned by coins-v3's own chain_id field.
const SOLANA_CHAIN_ID = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

const HOLDER_DEFAULTS = { holders: null, snipers: null, bundlers: null, devHolding: null };
const MARKET_DEFAULTS = {
  marketCap: null,
  athMarketCap: null,
  trades24h: null,
  priceChangeH24: null,
  pairAddress: null,
  chainId: null,
};

async function fetchHolderCount() {
  const res = await fetch(`https://frontend-api-v3.pump.fun/token-holders/${MINT}/count`, {
    headers: {
      accept: "application/json",
      "user-agent": "cannabook-stats",
      referer: `https://pump.fun/coin/${MINT}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.holderCount === "number" ? data.holderCount : null;
}

async function fetchHolderStats() {
  const [holderCount, breakdownRes] = await Promise.all([
    fetchHolderCount().catch(() => null),
    fetch(`https://advanced-api-v2.pump.fun/coins/top-holders-and-sol-balance/${MINT}`, {
      headers: {
        accept: "application/json",
        "user-agent": "cannabook-stats",
        origin: "https://pump.fun",
        referer: "https://pump.fun/",
      },
    }).catch(() => null),
  ]);

  if (!breakdownRes || !breakdownRes.ok) {
    return { ...HOLDER_DEFAULTS, holders: holderCount };
  }
  const data = await breakdownRes.json();
  const topHolders = Array.isArray(data.topHolders) ? data.topHolders : [];
  const fallbackCount = typeof data.totalHolders === "number" ? data.totalHolders : null;
  return {
    holders: holderCount ?? fallbackCount,
    snipers: topHolders.filter((h) => h.isSniper).length,
    bundlers: topHolders.filter((h) => h.isBundler).length,
    devHolding: topHolders.some((h) => h.isDev),
  };
}

async function fetchMarketCap() {
  const res = await fetch(`https://frontend-api-v3.pump.fun/coins-v3/${MINT}`, {
    headers: {
      accept: "application/json",
      "user-agent": "cannabook-stats",
      referer: `https://pump.fun/coin/${MINT}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.market_cap_usd === "number" ? data.market_cap_usd : null;
}

// The ath_market_cap field embedded in coins-v3 goes stale - this dedicated
// endpoint is the one pump.fun's own UI uses for the real all-time high.
async function fetchAthMarketCap() {
  const res = await fetch(
    `https://swap-api.pump.fun/v1/coins/${MINT}/ath?currency=USD&chainId=${SOLANA_CHAIN_ID}`,
    {
      headers: {
        accept: "application/json",
        "user-agent": "cannabook-stats",
        referer: `https://pump.fun/coin/${MINT}`,
      },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.athMarketCap === "number" ? data.athMarketCap : null;
}

async function fetchDexscreenerStats() {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${MINT}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return { trades24h: null, priceChangeH24: null, pairAddress: null, chainId: null, fallbackMarketCap: null };
  const data = await res.json();
  const pair = Array.isArray(data.pairs) ? data.pairs[0] : null;
  if (!pair) return { trades24h: null, priceChangeH24: null, pairAddress: null, chainId: null, fallbackMarketCap: null };
  const h24 = pair.txns?.h24;
  return {
    trades24h: h24 ? h24.buys + h24.sells : null,
    priceChangeH24:
      typeof pair.priceChange?.h24 === "number" ? pair.priceChange.h24 : null,
    pairAddress: pair.pairAddress ?? null,
    chainId: pair.chainId ?? null,
    fallbackMarketCap: typeof pair.marketCap === "number" ? pair.marketCap : pair.fdv ?? null,
  };
}

async function fetchMarketStats() {
  const [marketCap, athMarketCap, dex] = await Promise.all([
    fetchMarketCap().catch(() => null),
    fetchAthMarketCap().catch(() => null),
    fetchDexscreenerStats().catch(() => ({
      trades24h: null,
      priceChangeH24: null,
      pairAddress: null,
      chainId: null,
      fallbackMarketCap: null,
    })),
  ]);

  return {
    marketCap: marketCap ?? dex.fallbackMarketCap,
    athMarketCap,
    trades24h: dex.trades24h,
    priceChangeH24: dex.priceChangeH24,
    pairAddress: dex.pairAddress,
    chainId: dex.chainId,
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
