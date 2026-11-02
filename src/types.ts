// ─────────────────────────────────────────────────────────────
// SeqCarver Studio — shared domain types
// ─────────────────────────────────────────────────────────────

export type GridMode = "3x3" | "4x4";

export interface TileLinkConfig {
  url: string;
  target: "_blank" | "_self";
  hoverEffect: "none" | "spin" | "change-image";
  hoverImage?: string;
}

/** A rectangular portion of a source image shown by one panel of a spread. */
export interface SpreadSlice {
  source: string;
  bboxCols: number;
  bboxRows: number;
  offsetX: number;
  offsetY: number;
  filter?: string;
  stretchX: number;
  stretchY: number;
}

export interface PanelStyle {
  borderColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  textColor?: string;
}

export interface ParallaxConfig {
  depth: number;
  fgScale: number;
  mgScale: number;
  orbit: boolean;
  speed: number;
}

export interface PanelData {
  image: string;
  spread: SpreadSlice | null;
  rotation: string[];
  rotationInterval: number;
  rotating: boolean;
  link: TileLinkConfig;
  style: PanelStyle;
  parallax: ParallaxConfig | null;
}

export type SortMode =
  | "none"
  | "aspect-shape"
  | "aspect-wide-tall"
  | "aspect-tall-wide"
  | "color-rainbow"
  | "color-family"
  | "color-warm-cool"
  | "color-light-dark"
  | "color-dark-light";

export type GroupMode = "none" | "aspect-category" | "color-family";

export interface SliceAsset {
  name: string;
  url: string;
}

export interface SliceMeta {
  width: number;
  height: number;
  aspect: number;
  hue: number; // 0-360
  sat: number; // 0-1
  light: number; // 0-1
}

export interface AssetGroup {
  id: string;
  title: string;
  count: number;
  colorSwatch?: string;
}

export type AdvertPanelTab =
  | "spread"
  | "spread_studio"
  | "asset_sorter"
  | "parallax"
  | "media"
  | "rotation"
  | "link"
  | "swap"
  | "actions"
  | "styles";

export const defaultLink = (): TileLinkConfig => ({
  url: "",
  target: "_blank",
  hoverEffect: "none",
});

export const createPanel = (): PanelData => ({
  image: "",
  spread: null,
  rotation: [],
  rotationInterval: 3,
  rotating: false,
  link: defaultLink(),
  style: {},
  parallax: null,
});
