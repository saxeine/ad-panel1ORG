import type {
  GridMode,
  PanelData,
  PanelStyle,
  TileLinkConfig,
  SliceAsset,
  SliceMeta,
  SortMode,
  GroupMode,
  AssetGroup,
} from "../../types";

export type ToastKind = "success" | "info" | "error";

/** Everything the inspector modal & its tabs need, supplied by App. */
export interface ModalCtx {
  cols: number;
  panelCount: number;
  gridMode: GridMode;
  selectedSlot: number;
  panel: PanelData;
  panels: Record<number, PanelData>;
  placement: number[];
  slices: SliceAsset[];
  metas: Record<string, SliceMeta>;
  originalSpreadImage: string;
  disableActions: boolean;
  sortMode: SortMode;
  groupMode: GroupMode;
  groupFilter: string | null;
  groups: AssetGroup[];
  autoSort: boolean;
  isAnalyzing: boolean;

  toast: (msg: string, kind?: ToastKind) => void;
  selectSlot: (slot: number) => void;
  assignImage: (slot: number, url: string) => void;
  applySpread: (slots: number[], url: string, filter?: string, stretchX?: number, stretchY?: number) => void;
  setGridMode: (m: GridMode) => void;
  updatePanel: (slot: number, patch: Partial<PanelData>) => void;
  updateLink: (slot: number, patch: Partial<TileLinkConfig>) => void;
  updateStyle: (slot: number, patch: Partial<PanelStyle>) => void;
  applyStyleToAll: (patch: Partial<PanelStyle>) => void;
  swapSlots: (a: number, b: number) => void;
  sendToPool: (name: string, url: string) => void;
  resetPanel: (slot: number) => void;
  resetAllPanels: () => void;
  setOriginalSpreadImage: (url: string) => void;
  setDisableActions: (v: boolean) => void;
  onSortMode: (m: SortMode) => void;
  onGroupMode: (m: GroupMode) => void;
  onGroupFilter: (g: string | null) => void;
  onToggleAutoSort: (v: boolean) => void;
  applySortedOrder: () => void;
  resetSortedOrder: () => void;
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const allSlots = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);
