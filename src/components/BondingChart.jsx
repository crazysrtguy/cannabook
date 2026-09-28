import { useMemo, useRef, useState } from "react";
import { usePumpfunCandles } from "../hooks/usePumpfunCandles";

const BONDING_TARGET = 49000;

// Hardcoded hex (not CSS var()) - SVG gradient <stop> and presentation
// attributes don't reliably resolve custom properties across browsers.
const COLORS = {
  yellow: "#f2ff4d",
  hot: "#ff5b3d",
  line: "#2a292e",
  muted: "#98968d",
  ink: "#0a0a0c",
};

const TIMEFRAMES = [
  { key: "5m", label: "5M", resolution: "5", hours: 24 * 3 },
  { key: "1h", label: "1H", resolution: "60", hours: 24 * 14 },
  { key: "1d", label: "1D", resolution: "1D", hours: 24 * 365 },
];

const W = 900;
const H = 320;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 28;
const PAD_BOTTOM = 8;

function formatCompactUsd(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatTime(ts, timeframeKey) {
  const d = new Date(ts);
  if (timeframeKey === "1d") {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const BondingChart = ({ poolAddress, tokenAddress }) => {
  const [timeframeIndex, setTimeframeIndex] = useState(0);
  const timeframe = TIMEFRAMES[timeframeIndex];
  const candles = usePumpfunCandles(
    poolAddress,
    tokenAddress,
    timeframe.resolution,
    timeframe.hours
  );
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  const { points, minY, maxY, currentMC, areaPath, linePath } = useMemo(() => {
    if (!candles.length) {
      return { points: [], minY: 0, maxY: BONDING_TARGET, currentMC: null, areaPath: "", linePath: "" };
    }
    const values = candles.map((c) => c.c);
    const dataMin = Math.min(...values);
    // always keep the bonding target in frame - that's the whole point of the chart
    const dataMax = Math.max(...values, BONDING_TARGET);
    const span = dataMax - dataMin || 1;
    const yPad = span * 0.08;
    const minY = Math.max(0, dataMin - yPad);
    const maxY = dataMax + yPad;

    const innerW = W - PAD_LEFT - PAD_RIGHT;
    const innerH = H - PAD_TOP - PAD_BOTTOM;

    const points = candles.map((c, i) => {
      const x = PAD_LEFT + (i / Math.max(1, candles.length - 1)) * innerW;
      const y = PAD_TOP + innerH - ((c.c - minY) / (maxY - minY)) * innerH;
      return { x, y, ...c };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${PAD_TOP + innerH} L ${points[0].x.toFixed(2)} ${PAD_TOP + innerH} Z`
        : "";

    return { points, minY, maxY, currentMC: values[values.length - 1], areaPath, linePath };
  }, [candles]);

  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const bondingY =
    points.length && maxY > minY
      ? PAD_TOP + innerH - ((BONDING_TARGET - minY) / (maxY - minY)) * innerH
      : null;

  const progressPct = currentMC == null ? 0 : Math.min(100, (currentMC / BONDING_TARGET) * 100);
  const hovered = hoverIndex != null ? points[hoverIndex] : null;

  const handleMove = (e) => {
    if (!points.length || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(p.x - relX);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 16, padding: "20px 20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--yellow)", animation: "gb-pulse 1.4s ease-in-out infinite" }} />
            MARKET CAP
          </div>
          <div className="disp" style={{ fontSize: 32, color: "var(--yellow)" }}>
            {currentMC == null ? "—" : formatCompactUsd(currentMC)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>GOONING OUR WAY TO BONDING</div>
          <div className="disp" style={{ fontSize: 20, color: progressPct >= 100 ? "var(--yellow)" : "var(--hot)" }}>
            {progressPct.toFixed(1)}%
          </div>
        </div>
      </div>

      <div style={{ height: 6, borderRadius: 999, background: "var(--bg-raised)", overflow: "hidden", marginBottom: 16, border: "1px solid var(--line)" }}>
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #ff5b3d, #f2ff4d)",
            transition: "width 0.6s ease",
          }}
        />
      </div>

      <div style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: "auto", display: "block", cursor: points.length ? "crosshair" : "default" }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="bc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.yellow} stopOpacity="0.35" />
              <stop offset="100%" stopColor={COLORS.yellow} stopOpacity="0" />
            </linearGradient>
          </defs>

          {bondingY != null && (
            <>
              <line
                x1={PAD_LEFT}
                y1={bondingY}
                x2={W - PAD_RIGHT}
                y2={bondingY}
                stroke={COLORS.hot}
                strokeWidth="1.5"
                strokeDasharray="6 5"
                opacity="0.75"
              />
              <text x={W - PAD_RIGHT} y={Math.max(12, bondingY - 8)} textAnchor="end" fontSize="12" fontFamily="'Space Mono', monospace" fill={COLORS.hot}>
                BONDING · $49K
              </text>
            </>
          )}

          {points.length > 1 && (
            <>
              <path d={areaPath} fill="url(#bc-fill)" />
              <path d={linePath} fill="none" stroke={COLORS.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill={COLORS.yellow}>
                <animate attributeName="r" values="4;7;4" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {points.length === 1 && <circle cx={points[0].x} cy={points[0].y} r="5" fill={COLORS.yellow} />}

          {hovered && (
            <>
              <line x1={hovered.x} y1={PAD_TOP} x2={hovered.x} y2={H - PAD_BOTTOM} stroke={COLORS.line} strokeWidth="1" />
              <circle cx={hovered.x} cy={hovered.y} r="4" fill={COLORS.ink} stroke={COLORS.yellow} strokeWidth="2" />
            </>
          )}

          {!points.length && (
            <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fontFamily="'Space Mono', monospace" fill={COLORS.muted}>
              loading chart…
            </text>
          )}
        </svg>

        {hovered && (
          <div
            className="mono"
            style={{
              position: "absolute",
              left: `${(hovered.x / W) * 100}%`,
              top: 0,
              transform: hovered.x > W / 2 ? "translate(-105%, 0)" : "translate(5%, 0)",
              background: "rgba(10,10,12,0.92)",
              border: "1px solid var(--yellow)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 11,
              color: "var(--paper)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ color: "var(--yellow)", fontWeight: 700 }}>{formatCompactUsd(hovered.c)}</div>
            <div style={{ color: "var(--muted)" }}>{formatTime(hovered.t, timeframe.key)}</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {TIMEFRAMES.map((tf, i) => (
          <button
            key={tf.key}
            type="button"
            onClick={() => setTimeframeIndex(i)}
            className="mono"
            style={{
              background: i === timeframeIndex ? "var(--yellow)" : "transparent",
              color: i === timeframeIndex ? "var(--ink)" : "var(--muted)",
              border: `1px solid ${i === timeframeIndex ? "var(--yellow)" : "var(--line)"}`,
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
};
