// Proxies goonify.fun's public generations feed so the browser can poll it
// from cannabook's own origin (goonify.fun does not send CORS headers).
export default async function handler(req, res) {
  try {
    const upstream = await fetch("https://goonify.fun/api/generations?scope=public", {
      headers: { "user-agent": "cannabook-magazine-feed" },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "upstream_error" });
      return;
    }

    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: "fetch_failed" });
  }
}
