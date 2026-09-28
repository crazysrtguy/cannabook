import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useGoonifyFeed } from "../hooks/useGoonifyFeed";

const staticPictures = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
];

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
        <a
          className="pointer-events-auto mt-10 ml-10"
          href="https://t.me/+v5_6cI2X8Lw3ZDBh"
        >
          <img className="w-20" src="images/logo.png" />
        </a>
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>

      <div className="fixed inset-0 flex items-center -rotate-2 select-none">
        <div className="relative">
          <div className="bg-white/0  animate-horizontal-scroll flex items-center gap-8 w-max px-8">
            <h1 className="shrink-0 text-white text-10xl font-black ">
CannaVerse           </h1>
            <h2 className="shrink-0 text-white text-8xl italic font-light">
  META          </h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">
Community
            </h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
is            </h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">
              ON
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-extralight italic">
              the
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">
              way to
            </h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
           Take Over </h2>
          </div>
          <div className="absolute top 50 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-18 px-8 w-max">
            <h2 className="shrink-0 text-white text-10xl font-black ">
         SOLANA      </h2>

           
          </div>
        </div>
      </div>
    </>
  );
};
