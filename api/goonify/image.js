// Streams a single goonify.fun generation image through cannabook's own
// origin so it can be used as a WebGL texture without hitting CORS.
// `src` must be one of the relative paths returned by /api/goonify/generations
// (e.g. "/api/gen/gen-<id>.png?scope=public") - never an arbitrary URL, to
// avoid turning this into an open proxy.
const ALLOWED_SRC = /^\/api\/gen\/[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp)(\?scope=public)?$/;

export default async function handler(req, res) {
  const { src } = req.query;

  if (typeof src !== "string" || !ALLOWED_SRC.test(src)) {
    res.status(400).json({ error: "invalid_src" });
    return;
  }

  try {
    const upstream = await fetch(`https://goonify.fun${src}`);

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600, immutable");
    res.status(200).send(buffer);
  } catch (err) {
    res.status(502).end();
  }
}
