import { CanvasTexture, SRGBColorSpace } from "three";

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1366;

// A live canvas texture for the book covers - redrawn every frame in
// Book.jsx's useFrame loop so the glow/sheen behind "THE GOONING BIBLE"
// animates instead of sitting as a static jpg.
export function createAnimatedCoverCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { canvas, ctx, texture };
}

export function drawGooningBibleCover({ canvas, ctx }, t, isFront) {
  const w = canvas.width;
  const h = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#050505");
  bg.addColorStop(0.5, "#0d0d0d");
  bg.addColorStop(1, "#050505");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
  const glowY = isFront ? h * 0.42 : h * 0.5;
  const glowRadius = h * (0.3 + 0.06 * pulse);
  const glow = ctx.createRadialGradient(
    w / 2,
    glowY,
    glowRadius * 0.05,
    w / 2,
    glowY,
    glowRadius
  );
  glow.addColorStop(0, `rgba(242, 255, 77, ${0.5 + 0.3 * pulse})`);
  glow.addColorStop(1, "rgba(242, 255, 77, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = 0.12 + 0.06 * pulse;
  ctx.translate(w / 2, h / 2);
  ctx.rotate((t * 12 * Math.PI) / 180);
  const sheen = ctx.createLinearGradient(-w, 0, w, 0);
  sheen.addColorStop(0, "rgba(242,255,77,0)");
  sheen.addColorStop(0.5, "rgba(242,255,77,0.5)");
  sheen.addColorStop(1, "rgba(242,255,77,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(-w, -h, w * 2, h * 2);
  ctx.restore();

  ctx.strokeStyle = "rgba(242,255,77,0.75)";
  ctx.lineWidth = 10;
  ctx.strokeRect(34, 34, w - 68, h - 68);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(242,255,77,0.35)";
  ctx.strokeRect(56, 56, w - 112, h - 112);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (isFront) {
    ctx.shadowColor = "rgba(242,255,77,0.9)";
    ctx.shadowBlur = 18 + 22 * pulse;

    ctx.fillStyle = "#f2ff4d";
    ctx.font = "700 76px Georgia, 'Times New Roman', serif";
    ctx.fillText("THE", w / 2, h * 0.28);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 112px Georgia, 'Times New Roman', serif";
    ctx.fillText("GOONING", w / 2, h * 0.44);

    ctx.fillStyle = "#f2ff4d";
    ctx.font = "800 132px Georgia, 'Times New Roman', serif";
    ctx.fillText("BIBLE", w / 2, h * 0.62);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "italic 30px Georgia, serif";
    ctx.fillText("goonify.fun", w / 2, h * 0.9);
  } else {
    ctx.shadowColor = "rgba(242,255,77,0.7)";
    ctx.shadowBlur = 12 + 14 * pulse;

    ctx.fillStyle = "#f2ff4d";
    ctx.font = "800 84px Georgia, 'Times New Roman', serif";
    ctx.fillText("THE", w / 2, h * 0.42);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 66px Georgia, 'Times New Roman', serif";
    ctx.fillText("GOONING BIBLE", w / 2, h * 0.5);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "italic 26px Georgia, serif";
    ctx.fillText("$GOONIFY", w / 2, h * 0.58);
  }
}
