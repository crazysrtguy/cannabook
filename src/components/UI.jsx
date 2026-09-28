import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGoonifyFeed } from "../hooks/useGoonifyFeed";

// the old CannaVerse-themed picture set has been retired - the book now
// opens straight to the cover/back cover and fills in with live goonify
// generations only (see goonifyPicturesAtom below)
const staticPictures = [];

// Local curated pages resolve to /textures/<id>.jpg. Live goonify
// generations arrive as full proxied URLs and are used as-is.
export const resolveTextureSrc = (id) =>
  typeof id === "string" && (id.startsWith("/api/") || id.startsWith("http"))
    ? id
    : `/textures/${id}.jpg`;

export const pageAtom = atom(0);

// Holds the live goonify.fun generations (newest last), appended after the
// curated static pictures. Populated by the polling effect in UI below.
export const goonifyPicturesAtom = atom([]);

// Builds book leaves from a flat picture list. Unlike a fixed-size deck,
// `pictures` grows one item at a time as new goonify generations arrive, so
// this can't assume an even count the way the original template did - it
// pairs everything strictly once (no picture reused/dropped) and only ever
// falls back to the back-cover texture as filler, never duplicates content.
function buildPages(pictures) {
  if (pictures.length === 0) {
    return [{ front: "17", back: "18" }];
  }

  const pages = [{ front: "17", back: pictures[0] }];

  const middle = pictures.slice(1, pictures.length - 1);
  for (let i = 0; i < middle.length; i += 2) {
    pages.push({
      front: middle[i],
      back: middle[i + 1] ?? "18",
    });
  }

  if (pictures.length > 1) {
    pages.push({
      front: pictures[pictures.length - 1],
      back: "18",
    });
  }
  return pages;
}

export const pagesAtom = atom((get) =>
  buildPages([...staticPictures, ...get(goonifyPicturesAtom)])
);

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const pages = useAtomValue(pagesAtom);
  const goonifyImages = useGoonifyFeed();
  const setGoonifyPictures = useSetAtom(goonifyPicturesAtom);

  useEffect(() => {
    // feed is newest-first; reverse so the newest generation lands as the
    // last page of the book (right before the back cover)
    setGoonifyPictures([...goonifyImages].reverse());
  }, [goonifyImages, setGoonifyPictures]);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);

  return (
    <>
      <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <div className="pointer-events-auto mt-4 ml-4 sm:mt-10 sm:ml-10 flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#f2ff4d] rounded-[10px] border-2 border-black -rotate-6" />
          <span className="disp text-white text-base sm:text-xl">GOONIFY</span>
          <Link
            to="/"
            className="mono text-[10px] sm:text-[11px] tracking-wide text-[#f2ff4d]/80 border border-[#f2ff4d]/30 rounded-full px-2.5 py-1.5 sm:px-3 sm:py-2 hover:text-[#f2ff4d] hover:border-[#f2ff4d] transition-colors"
          >
            ← GOONIFY.FUN
          </Link>
        </div>
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-2 sm:gap-4 max-w-full p-4 sm:p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-[#f2ff4d] transition-all duration-300 px-3 py-2 sm:px-4 sm:py-3 rounded-full text-sm sm:text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-[#f2ff4d] text-black"
                    : "bg-black/40 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-[#f2ff4d] transition-all duration-300 px-3 py-2 sm:px-4 sm:py-3 rounded-full text-sm sm:text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-[#f2ff4d] text-black"
                  : "bg-black/40 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-24 sm:bottom-32 flex items-center -rotate-2 select-none pointer-events-none -z-10">
        <div className="relative">
          <div className="bg-white/0 animate-horizontal-scroll-2 flex items-center gap-18 px-8 w-max">
            <h2 className="shrink-0 disp text-[#f2ff4d] text-6xl sm:text-10xl font-black ">
         $GOONIFY      </h2>


          </div>
        </div>
      </div>
    </>
  );
};
