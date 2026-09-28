import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 20000;

// Polls cannabook's own /api/goonify/generations proxy (which mirrors
// goonify.fun's public feed) and returns proxied image URLs, newest first.
export function useGoonifyFeed() {
  const [images, setImages] = useState([]);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/goonify/generations");
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.generations) ? data.generations : [];
        if (cancelledRef.current) return;
        setImages(
          list.map((src) => `/api/goonify/image?src=${encodeURIComponent(src)}`)
        );
      } catch {
        // transient network/API failure - keep the last known list and retry next tick
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, []);

  return images;
}
