import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// 8x8 Bayer matrix for ordered dithering
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/**
 * Photo → two-tone plate. Luminance is remapped between a shadow and a
 * highlight colour, which is the donor's image treatment.
 *
 * Falls back to a flat shadow fill if the image fails to load, so a missing
 * asset never leaves a transparent hole in a section.
 */
export default function Duotone({
  src,
  shadow = "#ba0c2f",
  highlight = "#f6f7f8",
  /** raises midtones; >1 crushes toward the shadow */
  gamma = 1.2,
  /** luma below this maps to pure shadow — raise for a punchier plate */
  black = 0.05,
  /** luma above this maps to pure highlight — lower for a punchier plate */
  white = 0.88,
  /** ordered-dither to two hard colours instead of a smooth ramp */
  dither = false,
  /** working width when dithering — lower means chunkier dots */
  ditherWidth = 420,
  className = "",
  style,
}: {
  src: string;
  shadow?: string;
  highlight?: string;
  gamma?: number;
  black?: number;
  white?: number;
  dither?: boolean;
  ditherWidth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const [sr, sg, sb] = hexToRgb(shadow);
    const [hr, hg, hb] = hexToRgb(highlight);

    const paintFallback = () => {
      canvas.width = 8;
      canvas.height = 10;
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, 8, 10);
    };

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";

    img.onload = () => {
      if (cancelled) return;
      // cap the working size — these are decorative plates, not hero photos
      const target = dither ? ditherWidth : 900;
      const scale = Math.min(1, target / img.naturalWidth);
      const W = Math.max(1, Math.round(img.naturalWidth * scale));
      const H = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.width = W;
      canvas.height = H;
      ctx.drawImage(img, 0, 0, W, H);

      const frame = ctx.getImageData(0, 0, W, H);
      const d = frame.data;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          // Rec. 709 luma
          const raw =
            (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
          // stretch levels first — most photos sit in the middle of the range
          // and map to a muddy mix of the two inks without this
          const l = Math.min(1, Math.max(0, (raw - black) / (white - black)));
          let v = Math.pow(l, gamma);

          if (dither) {
            // threshold against the Bayer cell — two hard colours, no ramp
            v = v > (BAYER[y % 8][x % 8] + 0.5) / 64 ? 1 : 0;
          }

          d[i] = sr + (hr - sr) * v;
          d[i + 1] = sg + (hg - sg) * v;
          d[i + 2] = sb + (hb - sb) * v;
        }
      }
      ctx.putImageData(frame, 0, 0);
    };

    img.onerror = paintFallback;
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, shadow, highlight, gamma, black, white, dither, ditherWidth]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`h-full w-full object-cover ${className}`}
      style={{
        ...(dither ? { imageRendering: "pixelated" as const } : {}),
        ...style,
      }}
    />
  );
}
