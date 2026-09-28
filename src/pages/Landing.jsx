import { useState } from "react";
import { Link } from "react-router-dom";
import { useGoonifyFeed } from "../hooks/useGoonifyFeed";
import { usePumpfunStats } from "../hooks/usePumpfunStats";

const CA = "FovbmorCWsm1PXxwvje7iSohTVRuM6WeqytknZpGpump";
const TELEGRAM_URL = "https://t.me/+AS85ZfdRxFE1NzZh";
const X_URL = "https://x.com/i/communities/1947119751609659547";
const GOONIFICATOR_URL = "https://goonify.fun";

function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n < 1000) return String(Math.round(n));
  const units = ["", "K", "M", "B"];
  let unitIndex = 0;
  let value = n;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value.toFixed(1)}${units[unitIndex]}`;
}

function formatSignedPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

const pageStyles = `
  .landing-root{
    --bg:#0a0a0c;
    --bg-raised:#151417;
    --bg-card:#19181c;
    --line:#2a292e;
    --yellow:#f2ff4d;
    --yellow-soft:#f2ff4d1a;
    --ink:#0a0a0c;
    --paper:#f4f3ee;
    --muted:#98968d;
    --hot:#ff5b3d;
    background:var(--bg);
    color:var(--paper);
    font-family:'Space Grotesk',sans-serif;
    -webkit-font-smoothing:antialiased;
    position:relative;
    overflow:hidden;
    min-height:100vh;
  }
  .landing-root a{color:inherit;text-decoration:none}
  .landing-root ::selection{background:var(--yellow);color:var(--ink)}
  .landing-root .disp{font-family:'Archivo Black',sans-serif;text-transform:uppercase;letter-spacing:-0.01em}
  .landing-root .mono{font-family:'Space Mono',monospace}
  @keyframes gb-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes gb-blobfloat{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-3%,2%) scale(1.05)}}
  @keyframes gb-pulse{0%,100%{opacity:1}50%{opacity:.35}}
  .landing-root .grain{position:fixed;inset:0;pointer-events:none;opacity:.05;mix-blend-mode:overlay;z-index:50}
  .landing-root .btn-primary{transition:transform .15s ease, box-shadow .15s ease;cursor:pointer}
  .landing-root .btn-primary:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #000}
  .landing-root .btn-ghost{transition:border-color .15s,color .15s}
  .landing-root .btn-ghost:hover{border-color:var(--yellow);color:var(--yellow)}
  .landing-root .card-hover{transition:transform .18s ease, box-shadow .18s ease}
  .landing-root .card-hover:hover{transform:translateY(-4px);box-shadow:8px 8px 0 var(--yellow)}
  .landing-root .upzone{transition:border-color .15s,background .15s}
  .landing-root .upzone:hover{border-color:var(--yellow);background:var(--yellow-soft)}
  .landing-root .wrap{max-width:1240px;margin:0 auto;padding-left:24px;padding-right:24px}
  .landing-root .dex-embed{position:relative;width:100%;padding-bottom:56%;border-radius:16px;overflow:hidden;border:1px solid var(--line)}
  .landing-root .dex-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  @media (max-width:900px){
    .landing-root .grid-4{grid-template-columns:repeat(2,1fr) !important}
    .landing-root .grid-3{grid-template-columns:1fr !important}
    .landing-root .hero{flex-direction:column}
    .landing-root .dex-embed{padding-bottom:130%}
  }
`;

const GALLERY_PAGE_SIZE = 8;

export const Landing = () => {
  const [copyLabel, setCopyLabel] = useState("FovbmorCWsm...ZpGpump");
  const goonifyImages = useGoonifyFeed();
  const [galleryPage, setGalleryPage] = useState(0);
  const galleryPageCount = Math.max(1, Math.ceil(goonifyImages.length / GALLERY_PAGE_SIZE));
  const clampedGalleryPage = Math.min(galleryPage, galleryPageCount - 1);
  const galleryItems = goonifyImages.slice(
    clampedGalleryPage * GALLERY_PAGE_SIZE,
    clampedGalleryPage * GALLERY_PAGE_SIZE + GALLERY_PAGE_SIZE
  );
  const {
    holders,
    marketCap,
    snipers,
    bundlers,
    trades24h,
    priceChangeH24,
    pairAddress,
    chainId,
  } = usePumpfunStats();

  const copyCA = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(CA).catch(() => {});
    }
    setCopyLabel("COPIED!");
    setTimeout(() => setCopyLabel("FovbmorCWsm...ZpGpump"), 1600);
  };

  return (
    <div className="landing-root">
      <style>{pageStyles}</style>

      <svg className="grain" xmlns="http://www.w3.org/2000/svg">
        <filter id="n">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>

      {/* marquee ticker */}
      <div style={{ width: "100%", background: "var(--yellow)", borderBottom: "3px solid #000", overflow: "hidden", whiteSpace: "nowrap", padding: "8px 0", position: "relative", zIndex: 10 }}>
        <div style={{ display: "inline-flex", animation: "gb-marquee 18s linear infinite" }}>
          {[0, 1].map((i) => (
            <span key={i} className="disp mono" style={{ fontSize: 14, color: "var(--ink)", padding: "0 24px" }}>
              ★ $GOONIFY IS LIVE ★ CA: {CA} ★ GOONIFICATOR 2.0 OUT NOW ★ JOIN THE GALLERY ★
            </span>
          ))}
        </div>
      </div>

      {/* glow blobs */}
      <div style={{ position: "absolute", top: -120, right: -160, width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle,var(--yellow) 0%,transparent 70%)", opacity: 0.18, filter: "blur(40px)", animation: "gb-blobfloat 9s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 420, left: -200, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,var(--hot) 0%,transparent 70%)", opacity: 0.1, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* nav */}
      <div className="wrap" style={{ position: "relative", zIndex: 10, paddingTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "var(--yellow)", borderRadius: 10, border: "2px solid #000", transform: "rotate(-6deg)" }} />
          <span className="disp" style={{ fontSize: 22 }}>GOONIFY</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#how" className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>HOW IT WORKS</a>
          <a href="#gallery" className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>GALLERY</a>
          <Link to="/bible" className="mono" style={{ fontSize: 13, color: "var(--yellow)" }}>THE GOONING BIBLE</Link>
          <a href="#community" className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>COMMUNITY</a>
        </div>
        <a href="#buy" className="disp btn-primary" style={{ fontSize: 13, background: "var(--yellow)", color: "var(--ink)", padding: "12px 22px", borderRadius: 10, border: "2px solid #000", boxShadow: "4px 4px 0 #000" }}>BUY $GOONIFY</a>
      </div>

      {/* hero */}
      <div className="wrap hero" style={{ position: "relative", zIndex: 10, padding: "64px 24px 40px", display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 480px", minWidth: 320 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--bg-raised)", border: "1px solid var(--line)", borderRadius: 999, padding: "6px 14px", marginBottom: 22 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--yellow)", animation: "gb-pulse 1.4s ease-in-out infinite" }} />
            <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>LIVE ON SOLANA · GOONIFICATOR ONLINE</span>
          </div>
          <h1 className="disp" style={{ fontSize: "clamp(40px,5.4vw,78px)", lineHeight: 0.98, margin: "0 0 22px" }}>
            TURN ANY PFP<br />INTO A <span style={{ color: "var(--yellow)" }}>GOONIFIED</span><br />LEGEND
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--muted)", maxWidth: 460, margin: "0 0 30px" }}>
            Drop a cartoon, illustrated or anime avatar in. Get back something you can't unsee.
            Every generation lands in the public gallery — and the good ones get pulled straight
            into the community magazine.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 26 }}>
            <a href="#goonificator" className="disp btn-primary" style={{ fontSize: 15, background: "var(--yellow)", color: "var(--ink)", padding: "16px 28px", borderRadius: 12, border: "2px solid #000", boxShadow: "5px 5px 0 #000" }}>GOONIFY ME →</a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="disp btn-ghost" style={{ fontSize: 15, background: "transparent", color: "var(--paper)", padding: "16px 28px", borderRadius: 12, border: "2px solid var(--line)" }}>JOIN TELEGRAM</a>
          </div>
          <button onClick={copyCA} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--bg-raised)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            <span>{copyLabel}</span>
          </button>
        </div>

        <div id="goonificator" style={{ flex: "1 1 380px", minWidth: 320, maxWidth: 440 }}>
          <div style={{ background: "var(--bg-card)", border: "2px solid #000", borderRadius: 20, boxShadow: "10px 10px 0 var(--yellow)", transform: "rotate(1.5deg)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span className="disp" style={{ fontSize: 15, color: "var(--yellow)" }}>GOONIFICATOR</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>v2.0</span>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <div className="upzone" style={{ flex: 1, aspectRatio: "1", border: "2px dashed var(--line)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M12 3l-4 4M12 3l4 4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
                <span className="mono" style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>YOUR PFP</span>
              </div>
              <div style={{ flex: 1, aspectRatio: "1", borderRadius: 14, background: "linear-gradient(135deg,var(--yellow) 0%,#fff4a3 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", overflow: "hidden" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a0a0c" strokeWidth="2"><path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" /></svg>
                <span className="mono" style={{ fontSize: 10, color: "#0a0a0c", textAlign: "center", fontWeight: 700 }}>GOONIFIED</span>
              </div>
            </div>
            <a href={GOONIFICATOR_URL} target="_blank" rel="noopener noreferrer" className="disp btn-primary" style={{ display: "block", textAlign: "center", width: "100%", marginTop: 16, background: "var(--yellow)", color: "var(--ink)", padding: 14, borderRadius: 10, border: "2px solid #000", fontSize: 14, boxShadow: "4px 4px 0 #000", boxSizing: "border-box" }}>⚡ GOONIFY</a>
            <p className="mono" style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", margin: "12px 0 0" }}>works best on cartoon, illustrated &amp; anime avatars — opens the live goonificator</p>
          </div>
        </div>
      </div>

      {/* stat strip */}
      <div className="wrap grid-4" style={{ position: "relative", zIndex: 10, marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          { value: formatCompact(goonifyImages.length), label: "GOONIFICATIONS" },
          { value: formatCompact(holders), label: "HOLDERS" },
          { value: "24/7", label: "GOONING" },
          { value: marketCap == null ? "—" : `$${formatCompact(marketCap)}`, label: "MARKETCAP" },
          { value: formatCompact(trades24h), label: "24H TRADES" },
          {
            value: formatSignedPct(priceChangeH24),
            label: "24H CHANGE",
            color:
              priceChangeH24 == null
                ? "var(--yellow)"
                : priceChangeH24 >= 0
                ? "var(--yellow)"
                : "var(--hot)",
          },
          { value: formatCompact(snipers), label: "SNIPERS" },
          { value: formatCompact(bundlers), label: "BUNDLERS" },
        ].map(({ value, label, color }) => (
          <div key={label} className="card-hover" style={{ background: "var(--bg-raised)", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
            <div className="disp" style={{ fontSize: 28, color: color ?? "var(--yellow)" }}>{value}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <p className="wrap mono" style={{ position: "relative", zIndex: 10, fontSize: 10, color: "var(--muted)", marginTop: 10 }}>
        holders, snipers &amp; bundlers from pump.fun · trades, change &amp; market cap from DexScreener · refreshes every 30s
      </p>

      {/* live chart */}
      <div className="wrap" style={{ position: "relative", zIndex: 10, marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
          <h2 className="disp" style={{ fontSize: "clamp(22px,2.6vw,32px)", margin: 0 }}>LIVE CHART</h2>
          <div style={{ flex: 1, height: 2, background: "var(--line)" }} />
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>DEXSCREENER</span>
        </div>
        {pairAddress ? (
          <div className="dex-embed">
            <iframe
              title="$GOONIFY chart"
              src={`https://dexscreener.com/${chainId ?? "solana"}/${pairAddress}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&theme=dark&chartTheme=dark&chartStyle=1&chartType=usd&interval=15`}
            />
          </div>
        ) : (
          <div className="dex-embed" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card)" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>loading chart…</span>
          </div>
        )}
      </div>

      {/* how it works */}
      <div id="how" className="wrap" style={{ position: "relative", zIndex: 10, padding: "110px 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 44 }}>
          <h2 className="disp" style={{ fontSize: "clamp(28px,3.4vw,44px)", margin: 0 }}>HOW IT WORKS</h2>
          <div style={{ flex: 1, height: 2, background: "var(--line)" }} />
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>03 STEPS</span>
        </div>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          <div className="card-hover" style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 18, padding: 28, position: "relative" }}>
            <span className="disp" style={{ position: "absolute", top: 20, right: 24, fontSize: 44, color: "var(--line)" }}>01</span>
            <div style={{ width: 44, height: 44, background: "var(--yellow-soft)", border: "1px solid var(--yellow)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2"><path d="M12 3v12M12 3l-4 4M12 3l4 4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
            </div>
            <div className="disp" style={{ fontSize: 17, marginBottom: 8 }}>UPLOAD</div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>Drop in a cartoon, illustrated or anime PFP — the weirder the better.</p>
          </div>
          <div className="card-hover" style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 18, padding: 28, position: "relative" }}>
            <span className="disp" style={{ position: "absolute", top: 20, right: 24, fontSize: 44, color: "var(--line)" }}>02</span>
            <div style={{ width: 44, height: 44, background: "var(--yellow-soft)", border: "1px solid var(--yellow)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2"><path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" /></svg>
            </div>
            <div className="disp" style={{ fontSize: 17, marginBottom: 8 }}>GOONIFY</div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>The goonificator does its thing. Takes a few seconds. No going back.</p>
          </div>
          <div className="card-hover" style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 18, padding: 28, position: "relative" }}>
            <span className="disp" style={{ position: "absolute", top: 20, right: 24, fontSize: 44, color: "var(--line)" }}>03</span>
            <div style={{ width: 44, height: 44, background: "var(--yellow-soft)", border: "1px solid var(--yellow)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2"><path d="M4 12l6 6L20 6" /></svg>
            </div>
            <div className="disp" style={{ fontSize: 17, marginBottom: 8 }}>SHARE &amp; FEATURE</div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
              Download it, flex it — every public generation gets a page in{" "}
              <Link to="/bible" style={{ color: "var(--yellow)", textDecoration: "underline" }}>The Gooning Bible</Link>, automatically.
            </p>
          </div>
        </div>
      </div>

      {/* gallery */}
      <div id="gallery" className="wrap" style={{ position: "relative", zIndex: 10, padding: "80px 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 44 }}>
          <h2 className="disp" style={{ fontSize: "clamp(28px,3.4vw,44px)", margin: 0 }}>COMMUNITY GALLERY</h2>
          <div style={{ flex: 1, height: 2, background: "var(--line)" }} />
          <span className="mono" style={{ fontSize: 12, color: "var(--yellow)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--yellow)", animation: "gb-pulse 1.4s ease-in-out infinite" }} />
            LIVE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: "var(--bg-card)", border: "1px solid var(--yellow)", borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
          <div>
            <div className="disp" style={{ fontSize: 15, color: "var(--yellow)", marginBottom: 4 }}>📖 THE GOONING BIBLE</div>
            <p className="mono" style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>a living 3D book — every public goonification lands as a new page here and in the gallery below, automatically, gilded page edges and all.</p>
          </div>
          <Link to="/bible" className="disp btn-primary" style={{ background: "var(--yellow)", color: "var(--ink)", padding: "14px 22px", borderRadius: 10, border: "2px solid #000", fontSize: 13, whiteSpace: "nowrap", boxShadow: "4px 4px 0 #000" }}>OPEN THE BIBLE →</Link>
        </div>

        {galleryItems.length === 0 ? (
          <div style={{ border: "1px dashed var(--line)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
            <p className="mono" style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>no goonifications yet — be the first one in the gallery.</p>
            <a href="#goonificator" className="disp btn-primary" style={{ display: "inline-block", marginTop: 16, background: "var(--yellow)", color: "var(--ink)", padding: "12px 22px", borderRadius: 10, border: "2px solid #000", fontSize: 13 }}>GOONIFY ME →</a>
          </div>
        ) : (
          <>
            <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {galleryItems.map((src, i) => (
                <a
                  key={`${clampedGalleryPage}-${i}-${src}`}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-hover"
                  style={{ display: "block", aspectRatio: "1", borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden", background: "var(--bg-card)" }}
                >
                  <img
                    src={src}
                    alt="goonified generation"
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </a>
              ))}
            </div>

            {galleryPageCount > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 }}>
                <button
                  onClick={() => setGalleryPage((p) => Math.max(0, p - 1))}
                  disabled={clampedGalleryPage === 0}
                  className="mono btn-ghost"
                  style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 16px", color: clampedGalleryPage === 0 ? "var(--line)" : "var(--paper)", cursor: clampedGalleryPage === 0 ? "default" : "pointer", fontSize: 12 }}
                >
                  ← PREV
                </button>
                <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                  PAGE {clampedGalleryPage + 1} / {galleryPageCount}
                </span>
                <button
                  onClick={() => setGalleryPage((p) => Math.min(galleryPageCount - 1, p + 1))}
                  disabled={clampedGalleryPage >= galleryPageCount - 1}
                  className="mono btn-ghost"
                  style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 16px", color: clampedGalleryPage >= galleryPageCount - 1 ? "var(--line)" : "var(--paper)", cursor: clampedGalleryPage >= galleryPageCount - 1 ? "default" : "pointer", fontSize: 12 }}
                >
                  NEXT →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA band */}
      <div id="community" className="wrap" style={{ position: "relative", zIndex: 10, marginTop: 60, marginBottom: 60 }}>
        <div style={{ background: "var(--yellow)", border: "2px solid #000", borderRadius: 24, padding: "56px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", boxShadow: "12px 12px 0 #000" }}>
          <div>
            <h2 className="disp" style={{ fontSize: "clamp(26px,3.2vw,40px)", color: "var(--ink)", margin: "0 0 10px" }}>READY TO GET GOONIFIED?</h2>
            <p className="mono" style={{ fontSize: 13, color: "#3a3620", margin: 0 }}>no wallet needed to try it · connect only when you're ready to buy</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#goonificator" className="disp" style={{ background: "#0a0a0c", color: "var(--yellow)", padding: "16px 26px", borderRadius: 12, border: "2px solid #000", fontSize: 14 }}>GOONIFY NOW →</a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="disp" style={{ background: "transparent", color: "#0a0a0c", padding: "16px 26px", borderRadius: 12, border: "2px solid #0a0a0c", fontSize: 14 }}>TELEGRAM</a>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="wrap" style={{ position: "relative", zIndex: 10, padding: "30px 24px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, background: "var(--yellow)", borderRadius: 7, border: "2px solid #000", transform: "rotate(-6deg)" }} />
          <span className="disp" style={{ fontSize: 14 }}>GOONIFY</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>$GOONIFY IS A MEME COIN WITH NO INTRINSIC VALUE. HAVE FUN, DON'T BET THE RENT.</span>
        <div style={{ display: "flex", gap: 14 }}>
          <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="X" style={{ width: 34, height: 34, border: "1px solid var(--line)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.4 22H1.3l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2z" /></svg>
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Telegram" style={{ width: 34, height: 34, border: "1px solid var(--line)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 3.3L18.7 20c-.2 1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1L18.8 6c.4-.4-.1-.6-.6-.3L6.5 13l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.4 2.6c.9-.3 1.7.2 1.5 1.7z" /></svg>
          </a>
          <Link to="/bible" aria-label="The Gooning Bible" style={{ width: 34, height: 34, border: "1px solid var(--yellow)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
