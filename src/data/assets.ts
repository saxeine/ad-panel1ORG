import type { SliceAsset } from "../types";

export const MASTER_ARTWORK = "/images/master-artwork.jpg";
export const SILK_ARTWORK = "/images/emerald-silk.jpg";

const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=${h}&w=${w}`;

export const INITIAL_SLICES: SliceAsset[] = [
  { name: "Neon Street Fog", url: px(1597347, 1200, 627) },
  { name: "Midnight Silhouette", url: px(32114171, 1200, 627) },
  { name: "Tokyo Nights", url: px(29356751, 1200, 627) },
  { name: "Wet Asphalt", url: px(16158304, 1200, 627) },
  { name: "Crimson Glow", url: px(36806859, 1200, 627) },
  { name: "Red Editorial", url: px(16077169, 1200, 627) },
  { name: "Green Room", url: px(27698095, 800, 1200) },
  { name: "Shadow Muse", url: px(28863299, 800, 1200) },
  { name: "Beam Gaze", url: px(27398016, 800, 1200) },
  { name: "Low-Key Study", url: px(30743729, 800, 1200) },
  { name: "Coat Editorial", url: px(33502981, 800, 1200) },
  { name: "Studio Craft", url: px(13884518, 800, 1200) },
  { name: "Emerald Silk", url: SILK_ARTWORK },
];
