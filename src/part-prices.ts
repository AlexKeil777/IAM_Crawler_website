/** Illustrative offers in the same order as createPartShapes(). These are
 * fixed artwork values, rather than live offers or currency conversions. */
export const PRICE_OFFERS = [
  ["€149.95", "$184.37", "£128.60"],
  ["$849.99", "€729.50", "£675.24", "C$1,186.45"],
  ["$498.75", "€469.95", "£419.50", "A$759.20", "CHF 447.80"],
  ["€1,249.90", "$1,694.85", "£1,089.75", "C$2,248.60", "A$2,589.99", "CHF 1,398.40"],
  ["$389.99", "€329.48", "£284.50"],
  ["€689.95", "$829.40", "£598.65", "A$1,249.75"],
  ["$3,248.95", "€2,899.95", "£2,475.60", "C$4,449.80", "CHF 2,987.50"],
] as const;

export type PriceFrame = {
  width: number;
  height: number;
  shapeIndex: number;
  nextIndex: number;
  blend: number;
  time: number;
  paused: boolean;
};

type GlyphPoint = { x: number; y: number; alpha: number };
type PricePoint = GlyphPoint & { phase: number };
type Glyph = { width: number; height: number; points: GlyphPoint[] };
type Slot = readonly [number, number];

const DESKTOP_SLOTS: Record<number, readonly Slot[]> = {
  3: [[0.26, 0.13], [0.87, 0.45], [0.35, 0.87]],
  4: [[0.25, 0.12], [0.82, 0.26], [0.75, 0.86], [0.16, 0.73]],
  5: [[0.24, 0.12], [0.77, 0.16], [0.88, 0.53], [0.62, 0.88], [0.15, 0.77]],
  6: [[0.26, 0.11], [0.76, 0.14], [0.87, 0.50], [0.74, 0.88], [0.27, 0.88], [0.13, 0.50]],
};

const MOBILE_SLOTS: Record<number, readonly Slot[]> = {
  3: [[0.25, 0.09], [0.76, 0.11], [0.51, 0.90]],
  4: [[0.24, 0.09], [0.76, 0.11], [0.72, 0.89], [0.25, 0.91]],
  5: [[0.17, 0.09], [0.50, 0.11], [0.83, 0.09], [0.70, 0.89], [0.28, 0.91]],
  6: [[0.17, 0.09], [0.50, 0.11], [0.83, 0.09], [0.83, 0.89], [0.50, 0.91], [0.17, 0.89]],
};

/** Rasterize the actual font once, then paint each offer as individual grains.
 * Positions stay outside the sculpture and morph with its existing clock. */
export class ParticlePrices {
  private sampler = document.createElement("canvas");
  private glyphs = new Map<string, Glyph>();
  private layouts = new Map<string, PricePoint[]>();

  constructor(onReady?: () => void) {
    // A reduced-motion page also needs a fresh frame once Manrope replaces the
    // fallback font. The optional callback lets the owning canvas redraw it.
    void document.fonts.ready.then(() => {
      this.invalidate();
      onReady?.();
    });
  }

  invalidate() {
    this.glyphs.clear();
    this.layouts.clear();
  }

  private glyph(text: string, fontSize: number): Glyph {
    const key = `${fontSize}:${text}`;
    const retained = this.glyphs.get(key);
    if (retained) return retained;
    const ctx = this.sampler.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { width: 0, height: 0, points: [] };
    const resolution = 2;
    const font = `650 ${fontSize * resolution}px Manrope, sans-serif`;
    ctx.font = font;
    this.sampler.width = Math.ceil(ctx.measureText(text).width) + 8;
    this.sampler.height = Math.ceil(fontSize * resolution * 1.65);
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff";
    ctx.fillText(text, 4, 0);
    const { width, height } = this.sampler;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const points: GlyphPoint[] = [];
    let minY = height, maxY = 0;
    // A subpixel grid leaves visible gaps between grains without eroding the
    // counters and decimal points that make a small price readable.
    for (let y = 0.5; y < height; y += 1.55) {
      for (let x = 0.5; x < width; x += 1.55) {
        const alpha = pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3];
        if (alpha < 55) continue;
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        points.push({ x: x / resolution, y: y / resolution, alpha: Math.min(1, alpha / 205) });
      }
    }
    const glyph = {
      width: width / resolution,
      height: Math.max(0, (maxY - minY) / resolution),
      points: points.map((point) => ({ ...point, y: point.y - minY / resolution })),
    };
    this.glyphs.set(key, glyph);
    return glyph;
  }

  private layout(index: number, width: number, height: number): PricePoint[] {
    const key = `${index}:${width.toFixed(1)}:${height.toFixed(1)}`;
    const retained = this.layouts.get(key);
    if (retained) return retained;
    const offers = PRICE_OFFERS[index];
    if (!offers) return [];
    const compact = width < 470;
    const fontSize = compact ? (width < 350 ? 11 : 12) : 14;
    const slots = (compact ? MOBILE_SLOTS : DESKTOP_SLOTS)[offers.length];
    const points: PricePoint[] = [];
    offers.forEach((offer, labelIndex) => {
      const glyph = this.glyph(offer, fontSize);
      const [x, y] = slots[labelIndex];
      const left = Math.max(7, Math.min(width - glyph.width - 7, width * x - glyph.width / 2));
      const top = height * y - glyph.height / 2;
      for (const point of glyph.points) {
        points.push({ ...point, x: point.x + left, y: point.y + top, phase: labelIndex * 1.73 + index * 0.51 });
      }
    });
    // Mix letters and labels so a morph moves a cloud of grains instead of
    // pulling entire words across the canvas in a single coherent block.
    let seed = 3719 + index * 101;
    for (let i = points.length - 1; i > 0; i--) {
      seed = seed * 16807 % 2147483647;
      const j = Math.floor((seed - 1) / 2147483646 * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }
    if (this.layouts.size > 35) this.layouts.clear();
    this.layouts.set(key, points);
    return points;
  }

  draw(ctx: CanvasRenderingContext2D, frame: PriceFrame) {
    const { width, height, shapeIndex, nextIndex, time } = frame;
    if (width <= 0 || height <= 0) return;
    const blend = Math.max(0, Math.min(1, frame.blend));
    const from = this.layout(shapeIndex, width, height);
    const to = blend > 0 ? this.layout(nextIndex, width, height) : from;
    if (!from.length || !to.length) return;
    const count = Math.max(from.length, to.length);
    const scatter = Math.sin(blend * Math.PI);
    const drift = width < 470 ? 1 : 1.7;
    // The owning sculpture freezes time when paused. Using that same time
    // retains the exact label positions when the media preference changes.
    for (let i = 0; i < count; i++) {
      const a = from[i % from.length], b = to[i % to.length];
      const visibility = (i < from.length ? 1 - blend : 0) + (i < to.length ? blend : 0);
      if (visibility <= 0) continue;
      const seed = (((i + 1) * 2654435761) >>> 0) / 4294967296;
      const noise = Math.sin(i * 127.1 + 311.7);
      const ax = a.x + Math.sin(time * 0.38 + a.phase) * drift;
      const ay = a.y + Math.cos(time * 0.43 + a.phase) * drift;
      const bx = b.x + Math.sin(time * 0.38 + b.phase) * drift;
      const by = b.y + Math.cos(time * 0.43 + b.phase) * drift;
      const x = ax + (bx - ax) * blend + noise * scatter * 25;
      const y = ay + (by - ay) * blend + Math.cos(i * 73.7) * scatter * 19;
      const alpha = (a.alpha + (b.alpha - a.alpha) * blend) * visibility * (0.78 + seed * 0.2);
      ctx.fillStyle = i % 9 === 0
        ? `rgba(182,154,247,${alpha})`
        : `rgba(234,235,220,${alpha})`;
      const size = width < 470 ? 0.66 : 0.73;
      ctx.fillRect(x, y, size, size);
    }
  }
}
