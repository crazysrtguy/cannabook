import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom, useAtomValue } from "jotai";
import { easing } from "maath";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { createAnimatedCoverCanvas, drawGooningBibleCover } from "./coverArt";
import { pageAtom, pagesAtom, resolveTextureSrc } from "./UI";

const easingFactor = 0.5; // Controls the speed of the easing
const easingFactorFold = 0.3; // Controls the speed of the easing
const insideCurveStrength = 0.18; // Controls the strength of the curve
const outsideCurveStrength = 0.05; // Controls the strength of the curve
const turningCurveStrength = 0.09; // Controls the strength of the curve

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  // ALL VERTICES
  vertex.fromBufferAttribute(position, i); // get the vertex
  const x = vertex.x; // get the x position of the vertex

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)); // calculate the skin index
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH; // calculate the skin weight

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0); // set the skin indexes
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // set the skin weights
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");
const emissiveColor = new Color("#f2ff4d");
const gildedColor = new Color("#d4af00");

// gilded page edges - a bible-book detail
const pageMaterials = [
  new MeshStandardMaterial({
    color: gildedColor,
    metalness: 0.6,
    roughness: 0.35,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: gildedColor,
    metalness: 0.6,
    roughness: 0.35,
  }),
  new MeshStandardMaterial({
    color: gildedColor,
    metalness: 0.6,
    roughness: 0.35,
  }),
];

useTexture.preload(`/textures/rough.jpg`);

const Page = ({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  pagesLength,
  ...props
}) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    resolveTextureSrc(front),
    resolveTextureSrc(back),
    ...(number === 0 || number === pagesLength - 1
      ? [`/textures/rough.jpg`]
      : []),
  ]);
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const skinnedMeshRef = useRef();

  const isFrontCoverPage = number === 0;
  const isBackCoverPage = number === pagesLength - 1;

  // Front/back covers get a live animated canvas texture instead of the
  // static cover jpgs, redrawn every frame below.
  const frontCoverCanvas = useMemo(
    () => (isFrontCoverPage ? createAnimatedCoverCanvas() : null),
    []
  );
  const backCoverCanvas = useMemo(
    () => (isBackCoverPage ? createAnimatedCoverCanvas() : null),
    []
  );

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone); // attach the new bone to the previous bone
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: frontCoverCanvas ? frontCoverCanvas.texture : picture,
        ...(number === 0
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: backCoverCanvas ? backCoverCanvas.texture : picture2,
        ...(number === pagesLength - 1
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  // useHelper(skinnedMeshRef, SkeletonHelper, "red");

  useFrame((state, delta) => {
    if (frontCoverCanvas) {
      drawGooningBibleCover(frontCoverCanvas, state.clock.elapsedTime, true);
      frontCoverCanvas.texture.needsUpdate = true;
    }
    if (backCoverCanvas) {
      drawGooningBibleCover(backCoverCanvas, state.clock.elapsedTime, false);
      backCoverCanvas.texture.needsUpdate = true;
    }

    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  const [_, setPage] = useAtom(pageAtom);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

// With 200+ generations the book can have 100+ pages - mounting a full
// SkinnedMesh (31 bones) with full-res textures for every single one at once
// is what causes the slow initial load and the GPU-starved/glitchy pages
// once you flip deep into the book. Only the first EAGER_PAGE_COUNT pages and
// pages within LAZY_WINDOW of the current page are actually mounted/loaded;
// the rest are skipped until they're approached.
const EAGER_PAGE_COUNT = 10;
const LAZY_WINDOW = 6;

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const pages = useAtomValue(pagesAtom);
  const [delayedPage, setDelayedPage] = useState(page);

  useEffect(() => {
    pages.forEach((p, index) => {
      if (index < EAGER_PAGE_COUNT || Math.abs(index - delayedPage) <= LAZY_WINDOW) {
        useTexture.preload(resolveTextureSrc(p.front));
        useTexture.preload(resolveTextureSrc(p.back));
      }
    });
  }, [pages, delayedPage]);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) => {
        if (index >= EAGER_PAGE_COUNT && Math.abs(index - delayedPage) > LAZY_WINDOW) {
          return null;
        }
        return (
          // Each page gets its own Suspense boundary so a not-yet-loaded
          // page waits on its own instead of blanking the whole book (which
          // otherwise happens on every turn once pages lazy-load).
          <Suspense key={index} fallback={null}>
            <Page
              page={delayedPage}
              number={index}
              opened={delayedPage > index}
              bookClosed={delayedPage === 0 || delayedPage === pages.length}
              pagesLength={pages.length}
              {...pageData}
            />
          </Suspense>
        );
      })}
    </group>
  );
};
