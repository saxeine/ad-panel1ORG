// ─────────────────────────────────────────────────────────────
// Spread engine — slices one image across any slot selection of
// either the 3×3 or 4×4 grid. Positions are slot-space math, so a
// spread authored on one grid can be re-applied to the other.
// ─────────────────────────────────────────────────────────────
import type { CSSProperties } from "react";
import {
  Sparkles,
  Circle,
  Palette,
  RefreshCw,
  EyeOff,
  Sliders,
  Zap,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { SpreadSlice } from "../types";

export interface SpreadEffect {
  id: string;
  label: string;
  filter: string;
  icon: LucideIcon;
}

export const SPREAD_EFFECTS: SpreadEffect[] = [
  { id: "none", label: "Normal", filter: "none", icon: Sparkles },
  { id: "grayscale", label: "B&W", filter: "grayscale(100%)", icon: Circle },
  { id: "sepia", label: "Sepia", filter: "sepia(100%)", icon: Palette },
  { id: "invert", label: "Invert", filter: "invert(100%)", icon: RefreshCw },
  { id: "blur", label: "Blur", filter: "blur(2px)", icon: EyeOff },
  { id: "hue-rotate", label: "Hue", filter: "hue-rotate(90deg)", icon: Sliders },
  { id: "contrast", label: "Contrast", filter: "contrast(200%)", icon: Zap },
  { id: "saturate", label: "Vivid", filter: "saturate(200%)", icon: Star },
];

export interface SpreadPreset {
  label: string;
  boxes: number[];
}

/** Column-count aware presets — this is what fixes 3×3 vs 4×4 spread targets. */
export function spreadPresets(cols: number): SpreadPreset[] {
  if (cols === 4) {
    return [
      { label: "16 Panels", boxes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
      { label: "12 Panels", boxes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      { label: "9 Panels", boxes: [1, 2, 3, 5, 6, 7, 9, 10, 11] },
      { label: "8 Panels", boxes: [1, 2, 3, 4, 5, 6, 7, 8] },
      { label: "6 Panels", boxes: [1, 2, 3, 5, 6, 7] },
      { label: "4 Panels", boxes: [1, 2, 5, 6] },
    ];
  }
  return [
    { label: "9 Panels", boxes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { label: "8 Panels", boxes: [1, 2, 3, 4, 5, 6, 7, 8] },
    { label: "7 Panels", boxes: [1, 2, 3, 4, 5, 6, 7] },
    { label: "6 Panels", boxes: [1, 2, 3, 4, 5, 6] },
    { label: "5 Panels", boxes: [1, 2, 3, 4, 5] },
    { label: "4 Panels", boxes: [1, 2, 4, 5] },
  ];
}

/**
 * Computes one SpreadSlice per selected slot. The bounding box of the
 * selection defines the slice lattice, so any rectangular selection
 * (full grid, block, row…) tiles the source seamlessly.
 */
export function computeSpreadSlices(
  selectedSlots: number[],
  cols: number,
  source: string,
  filter: string | undefined,
  stretchX: number,
  stretchY: number
): Record<number, SpreadSlice> {
  const cells = selectedSlots.map((s) => ({
    slot: s,
    col: (s - 1) % cols,
    row: Math.floor((s - 1) / cols),
  }));
  if (cells.length === 0) return {};
  const minCol = Math.min(...cells.map((c) => c.col));
  const maxCol = Math.max(...cells.map((c) => c.col));
  const minRow = Math.min(...cells.map((c) => c.row));
  const maxRow = Math.max(...cells.map((c) => c.row));
  const bboxCols = maxCol - minCol + 1;
  const bboxRows = maxRow - minRow + 1;

  const out: Record<number, SpreadSlice> = {};
  for (const c of cells) {
    out[c.slot] = {
      source,
      bboxCols,
      bboxRows,
      offsetX: c.col - minCol,
      offsetY: c.row - minRow,
      filter,
      stretchX,
      stretchY,
    };
  }
  return out;
}

/** CSS background math that makes one tile render exactly its slice. */
export function sliceBackgroundStyle(s: SpreadSlice): CSSProperties {
  const sizeX = s.bboxCols * 100 * s.stretchX;
  const sizeY = s.bboxRows * 100 * s.stretchY;
  const posX = s.bboxCols > 1 ? (s.offsetX / (s.bboxCols - 1)) * 100 : 50;
  const posY = s.bboxRows > 1 ? (s.offsetY / (s.bboxRows - 1)) * 100 : 50;
  return {
    backgroundImage: `url("${s.source}")`,
    backgroundSize: `${sizeX}% ${sizeY}%`,
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: "no-repeat",
  };
}

/* ---------- color helpers ---------- */
export function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16) / 255;
  const g = parseInt(m.substring(2, 4), 16) / 255;
  const b = parseInt(m.substring(4, 6), 16) / 255;
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
