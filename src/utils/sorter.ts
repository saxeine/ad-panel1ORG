// ─────────────────────────────────────────────────────────────
// Asset sorter — real aspect measurement + best-effort color
// sampling (falls back to neutral metadata when CORS blocks
// canvas reads) powering sort & cluster modes.
// ─────────────────────────────────────────────────────────────
import type { SliceAsset, SliceMeta, SortMode, GroupMode, AssetGroup } from "../types";

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

/** Loads an image, returns aspect + sampled average HSL. Never rejects. */
export function analyzeImage(url: string): Promise<SliceMeta> {
  return new Promise((resolve) => {
    const fallback: SliceMeta = { width: 1, height: 1, aspect: 1, hue: 210, sat: 0.08, light: 0.45 };
    const img = new Image();
    img.crossOrigin = "anonymous";
    const done = (meta: SliceMeta) => resolve(meta);
    img.onload = () => {
      const w = img.naturalWidth || 1;
      const h = img.naturalHeight || 1;
      let hue = 210;
      let sat = 0.08;
      let light = 0.45;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 8;
        canvas.height = 8;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, 8, 8);
          const data = ctx.getImageData(0, 0, 8, 8).data;
          let r = 0,
            g = 0,
            b = 0;
          const n = data.length / 4;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          const hsl = rgbToHsl(r / n, g / n, b / n);
          hue = hsl.h;
          sat = hsl.s;
          light = hsl.l;
        }
      } catch {
        /* tainted canvas — keep neutral fallback */
      }
      done({ width: w, height: h, aspect: w / h, hue, sat, light });
    };
    img.onerror = () => done(fallback);
    img.src = url;
  });
}

export type AspectCategory = "ultra-wide" | "wide" | "square" | "tall" | "ultra-tall";

export function aspectCategory(m: SliceMeta): AspectCategory {
  const r = m.aspect;
  if (r > 2.05) return "ultra-wide";
  if (r > 1.14) return "wide";
  if (r < 0.48) return "ultra-tall";
  if (r < 0.88) return "tall";
  return "square";
}

export const ASPECT_ORDER: AspectCategory[] = ["ultra-wide", "wide", "square", "tall", "ultra-tall"];

export const COLOR_FAMILIES = [
  { id: "red", title: "Reds", swatch: "#ef4444", test: (h: number) => h < 15 || h >= 345 },
  { id: "orange", title: "Oranges", swatch: "#f97316", test: (h: number) => h >= 15 && h < 45 },
  { id: "yellow", title: "Yellows", swatch: "#eab308", test: (h: number) => h >= 45 && h < 70 },
  { id: "green", title: "Greens", swatch: "#22c55e", test: (h: number) => h >= 70 && h < 160 },
  { id: "teal", title: "Teals", swatch: "#14b8a6", test: (h: number) => h >= 160 && h < 195 },
  { id: "blue", title: "Blues", swatch: "#3b82f6", test: (h: number) => h >= 195 && h < 250 },
  { id: "purple", title: "Purples", swatch: "#a855f7", test: (h: number) => h >= 250 && h < 290 },
  { id: "pink", title: "Pinks", swatch: "#ec4899", test: (h: number) => h >= 290 && h < 345 },
] as const;

export function colorFamilyId(m: SliceMeta): string {
  if (m.sat < 0.14) return m.light < 0.16 ? "shadow" : "neutral";
  const fam = COLOR_FAMILIES.find((f) => f.test(m.hue));
  return fam ? fam.id : "neutral";
}

function warmth(m: SliceMeta): number {
  if (m.sat < 0.14) return -2;
  return Math.cos(((m.hue - 30) * Math.PI) / 180);
}

function metaOf(metas: Record<string, SliceMeta>, url: string): SliceMeta {
  return metas[url] || { width: 1, height: 1, aspect: 1, hue: 210, sat: 0.08, light: 0.45 };
}

export function sortSlices(
  slices: SliceAsset[],
  metas: Record<string, SliceMeta>,
  mode: SortMode
): SliceAsset[] {
  if (mode === "none") return slices;
  const decorated = slices.map((s, i) => ({ s, i, m: metaOf(metas, s.url) }));
  const cmp = (a: (typeof decorated)[0], b: (typeof decorated)[0]): number => {
    switch (mode) {
      case "aspect-shape": {
        const da = ASPECT_ORDER.indexOf(aspectCategory(a.m));
        const db = ASPECT_ORDER.indexOf(aspectCategory(b.m));
        return da !== db ? da - db : b.m.aspect - a.m.aspect;
      }
      case "aspect-wide-tall":
        return b.m.aspect - a.m.aspect;
      case "aspect-tall-wide":
        return a.m.aspect - b.m.aspect;
      case "color-rainbow": {
        const na = a.m.sat < 0.14 ? 999 : a.m.hue;
        const nb = b.m.sat < 0.14 ? 999 : b.m.hue;
        return na - nb;
      }
      case "color-family": {
        const order = [...COLOR_FAMILIES.map((f) => f.id as string), "neutral", "shadow"];
        const da = order.indexOf(colorFamilyId(a.m));
        const db = order.indexOf(colorFamilyId(b.m));
        return da !== db ? da - db : a.m.hue - b.m.hue;
      }
      case "color-warm-cool":
        return warmth(b.m) - warmth(a.m);
      case "color-light-dark":
        return b.m.light - a.m.light;
      case "color-dark-light":
        return a.m.light - b.m.light;
      default:
        return 0;
    }
  };
  decorated.sort((a, b) => {
    const r = cmp(a, b);
    return r !== 0 ? r : a.i - b.i;
  });
  return decorated.map((d) => d.s);
}

export function groupIdOf(metas: Record<string, SliceMeta>, url: string, mode: GroupMode): string {
  const m = metaOf(metas, url);
  if (mode === "aspect-category") return aspectCategory(m);
  if (mode === "color-family") return colorFamilyId(m);
  return "all";
}

export function buildGroups(
  slices: SliceAsset[],
  metas: Record<string, SliceMeta>,
  mode: GroupMode
): AssetGroup[] {
  if (mode === "none") return [];
  const counts = new Map<string, number>();
  slices.forEach((s) => {
    const id = groupIdOf(metas, s.url, mode);
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  if (mode === "aspect-category") {
    const labels: Record<string, string> = {
      "ultra-wide": "Ultra-Wide",
      wide: "Wide",
      square: "Square",
      tall: "Tall",
      "ultra-tall": "Ultra-Tall",
    };
    return ASPECT_ORDER.filter((id) => counts.has(id)).map((id) => ({
      id,
      title: labels[id],
      count: counts.get(id) || 0,
    }));
  }
  const out: AssetGroup[] = COLOR_FAMILIES.filter((f) => counts.has(f.id)).map((f) => ({
    id: f.id,
    title: f.title,
    count: counts.get(f.id) || 0,
    colorSwatch: f.swatch,
  }));
  if (counts.has("neutral")) out.push({ id: "neutral", title: "Neutrals", count: counts.get("neutral") || 0, colorSwatch: "#94a3b8" });
  if (counts.has("shadow")) out.push({ id: "shadow", title: "Shadows", count: counts.get("shadow") || 0, colorSwatch: "#334155" });
  return out;
}

export function aspectLabel(m: SliceMeta): string {
  const { width: w, height: h } = m;
  if (!w || !h) return "1:1";
  const r = w / h;
  if (Math.abs(r - 1) < 0.04) return "1:1";
  if (Math.abs(r - 16 / 9) < 0.06) return "16:9";
  if (Math.abs(r - 9 / 16) < 0.06) return "9:16";
  if (Math.abs(r - 4 / 3) < 0.05) return "4:3";
  if (Math.abs(r - 3 / 2) < 0.05) return "3:2";
  if (Math.abs(r - 2 / 3) < 0.05) return "2:3";
  if (r > 2) return "21:9";
  return r > 1 ? `${r.toFixed(2)}:1` : `1:${(1 / r).toFixed(2)}`;
}
