// ─────────────────────────────────────────────────────────────
// SeqCarver Studio — Front Page Advert Panel Console.
// A live panel board that spring-glides between 3×3 and 4×4,
// with a floating inspector deck for spreads, sorter, parallax,
// media, rotation, links, swaps, actions and style dials.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Grid3x3,
  LayoutGrid,
  Layers,
  SlidersHorizontal,
  Maximize2,
  RotateCcw,
  Link2,
  RotateCw,
  Box,
  ArrowDownUp,
  MousePointerClick,
} from "lucide-react";
import { cn } from "./utils/cn";
import {
  createPanel,
  type AdvertPanelTab,
  type GridMode,
  type GroupMode,
  type PanelData,
  type PanelStyle,
  type SliceAsset,
  type SliceMeta,
  type SortMode,
  type TileLinkConfig,
} from "./types";
import { computeSpreadSlices } from "./utils/spread";
import { analyzeImage, buildGroups, sortSlices } from "./utils/sorter";
import { INITIAL_SLICES, MASTER_ARTWORK, SILK_ARTWORK } from "./data/assets";
import { GridStage } from "./components/GridStage";
import { PoolPanel } from "./components/PoolPanel";
import { Toasts, type ToastMsg } from "./components/Toasts";
import { CustomizationHost } from "./components/Customizable";
import { AdvertPanelFullScreenModal } from "./components/modal/AdvertPanelFullScreenModal";
import type { ModalCtx, ToastKind } from "./components/modal/ctx";

function buildInitialPanels(): Record<number, PanelData> {
  const panels: Record<number, PanelData> = {};
  const spread = computeSpreadSlices([1, 2, 3, 4, 5, 6, 7, 8, 9], 3, MASTER_ARTWORK, "none", 1, 1);
  for (let i = 1; i <= 16; i++) {
    panels[i] = createPanel();
    if (spread[i]) panels[i].spread = spread[i];
  }
  // demo richness
  panels[7].rotation = [INITIAL_SLICES[0].url, INITIAL_SLICES[2].url, INITIAL_SLICES[4].url];
  panels[7].rotationInterval = 2;
  panels[7].rotating = true;
  panels[4].link = {
    url: "https://www.pexels.com",
    target: "_blank",
    hoverEffect: "change-image",
    hoverImage: SILK_ARTWORK,
  };
  panels[1].style.borderColor = "#10b981";
  return panels;
}

export default function App() {
  /* ---------------- grid geometry ---------------- */
  const [gridMode, setGridModeState] = useState<GridMode>("3x3");
  const cols = gridMode === "3x3" ? 3 : 4;
  const panelCount = cols * cols;
  const [placement, setPlacement] = useState<number[]>(() => Array.from({ length: 16 }, (_, i) => i + 1));
  const [panels, setPanels] = useState<Record<number, PanelData>>(buildInitialPanels);
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [originalSpreadImage, setOriginalSpreadImage] = useState(MASTER_ARTWORK);
  const [disableActions, setDisableActions] = useState(false);

  /* ---------------- storyboard pool / sorter ---------------- */
  const [slices, setSlices] = useState<SliceAsset[]>(INITIAL_SLICES);
  const [metas, setMetas] = useState<Record<string, SliceMeta>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [groupMode, setGroupMode] = useState<GroupMode>("none");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [autoSort, setAutoSort] = useState(false);
  const [poolOpen, setPoolOpen] = useState(true);

  /* ---------------- modal & toasts ---------------- */
  const [modal, setModal] = useState<{ open: boolean; tab: AdvertPanelTab }>({ open: false, tab: "spread" });
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const toastIdRef = useRef(0);

  const toast = useCallback((text: string, kind: ToastKind = "success") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t.slice(-3), { id, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  /* ---------------- asset analysis ---------------- */
  useEffect(() => {
    const missing = slices.filter((s) => !metas[s.url]);
    if (missing.length === 0) {
      setIsAnalyzing(false);
      return;
    }
    let cancelled = false;
    setIsAnalyzing(true);
    (async () => {
      for (const s of missing) {
        const m = await analyzeImage(s.url);
        if (cancelled) return;
        setMetas((prev) => ({ ...prev, [s.url]: m }));
      }
      if (!cancelled) setIsAnalyzing(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slices]);

  const groups = useMemo(() => buildGroups(slices, metas, groupMode), [slices, metas, groupMode]);

  /* ---------------- panel helpers ---------------- */
  const panelIdAt = useCallback((slot: number) => placement[slot - 1] ?? slot, [placement]);

  const updatePanel = useCallback(
    (slot: number, patch: Partial<PanelData>) => {
      const pid = panelIdAt(slot);
      setPanels((prev) => ({ ...prev, [pid]: { ...(prev[pid] || createPanel()), ...patch } }));
    },
    [panelIdAt]
  );

  const updateLink = useCallback(
    (slot: number, patch: Partial<TileLinkConfig>) => {
      const pid = panelIdAt(slot);
      setPanels((prev) => {
        const cur = prev[pid] || createPanel();
        return { ...prev, [pid]: { ...cur, link: { ...cur.link, ...patch } } };
      });
    },
    [panelIdAt]
  );

  const updateStyle = useCallback(
    (slot: number, patch: Partial<PanelStyle>) => {
      const pid = panelIdAt(slot);
      setPanels((prev) => {
        const cur = prev[pid] || createPanel();
        return { ...prev, [pid]: { ...cur, style: { ...cur.style, ...patch } } };
      });
    },
    [panelIdAt]
  );

  const applyStyleToAll = useCallback(
    (patch: Partial<PanelStyle>) => {
      setPanels((prev) => {
        const next = { ...prev };
        for (let s = 1; s <= panelCount; s++) {
          const pid = placement[s - 1] ?? s;
          next[pid] = { ...(next[pid] || createPanel()), style: { ...(next[pid]?.style || {}), ...patch } };
        }
        return next;
      });
    },
    [panelCount, placement]
  );

  const assignImage = useCallback(
    (slot: number, url: string) => {
      const pid = panelIdAt(slot);
      setPanels((prev) => ({ ...prev, [pid]: { ...(prev[pid] || createPanel()), image: url, spread: null } }));
    },
    [panelIdAt]
  );

  const applySpread = useCallback(
    (slots: number[], url: string, filter = "none", stretchX = 1, stretchY = 1) => {
      const mapped = computeSpreadSlices(slots, cols, url, filter === "none" ? undefined : filter, stretchX, stretchY);
      setPanels((prev) => {
        const next = { ...prev };
        for (const slot of slots) {
          const pid = placement[slot - 1] ?? slot;
          const cur = next[pid] || createPanel();
          next[pid] = { ...cur, image: "", spread: mapped[slot] || null };
        }
        return next;
      });
    },
    [cols, placement]
  );

  const swapSlots = useCallback((a: number, b: number) => {
    if (a === b) return;
    setPlacement((prev) => {
      const next = [...prev];
      const tmp = next[a - 1];
      next[a - 1] = next[b - 1];
      next[b - 1] = tmp;
      return next;
    });
  }, []);

  const setGridMode = useCallback(
    (m: GridMode) => {
      setGridModeState((prev) => {
        if (prev === m) return prev;
        if (m === "3x3") setSelectedSlot((s) => Math.min(s, 9));
        toast(
          m === "4x4"
            ? "Expanded to 4×4 — panels glide into 16 slots"
            : "Reverted to 3×3 — panels 10–16 safely stashed",
          "info"
        );
        return m;
      });
    },
    [toast]
  );

  const sendToPool = useCallback((name: string, url: string) => {
    setSlices((prev) => [...prev, { name, url }]);
  }, []);

  const resetPanel = useCallback(
    (slot: number) => {
      const pid = panelIdAt(slot);
      setPanels((prev) => ({ ...prev, [pid]: createPanel() }));
    },
    [panelIdAt]
  );

  const resetAllPanels = useCallback(() => {
    setPanels(() => {
      const next: Record<number, PanelData> = {};
      for (let i = 1; i <= 16; i++) next[i] = createPanel();
      return next;
    });
    setPlacement(Array.from({ length: 16 }, (_, i) => i + 1));
  }, []);

  const toggleRotate = useCallback(
    (slot: number) => {
      const pid = panelIdAt(slot);
      setPanels((prev) => {
        const cur = prev[pid] || createPanel();
        return { ...prev, [pid]: { ...cur, rotating: !cur.rotating } };
      });
    },
    [panelIdAt]
  );

  const openLink = useCallback(
    (url: string, target: string) => {
      window.open(url, target === "_self" ? "_self" : "_blank");
      toast(`Opening link in ${target === "_self" ? "same tab" : "new window"}`, "info");
    },
    [toast]
  );

  const applySortedOrder = useCallback(() => {
    setSlices((prev) => sortSlices(prev, metas, sortMode));
    setSortMode("none");
  }, [metas, sortMode]);

  const resetSortedOrder = useCallback(() => {
    setSlices([...INITIAL_SLICES]);
    setSortMode("none");
    setGroupMode("none");
    setGroupFilter(null);
  }, []);

  const handleGroupMode = useCallback((m: GroupMode) => {
    setGroupMode(m);
    setGroupFilter(null);
  }, []);

  const openModal = useCallback((slot: number, tab: AdvertPanelTab = "spread") => {
    setSelectedSlot(slot);
    setModal({ open: true, tab });
  }, []);

  /* ---------------- modal ctx ---------------- */
  const selectedPanel = panels[panelIdAt(selectedSlot)] || createPanel();

  const ctx: ModalCtx = {
    cols,
    panelCount,
    gridMode,
    selectedSlot,
    panel: selectedPanel,
    panels,
    placement,
    slices,
    metas,
    originalSpreadImage,
    disableActions,
    sortMode,
    groupMode,
    groupFilter,
    groups,
    autoSort,
    isAnalyzing,
    toast,
    selectSlot: setSelectedSlot,
    assignImage,
    applySpread,
    setGridMode,
    updatePanel,
    updateLink,
    updateStyle,
    applyStyleToAll,
    swapSlots,
    sendToPool,
    resetPanel,
    resetAllPanels,
    setOriginalSpreadImage,
    setDisableActions,
    onSortMode: setSortMode,
    onGroupMode: handleGroupMode,
    onGroupFilter: setGroupFilter,
    onToggleAutoSort: setAutoSort,
    applySortedOrder,
    resetSortedOrder,
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-abyss relative">
      {/* ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full bg-purple-500/[0.04] blur-[110px]" />
        <div className="absolute inset-0 bg-blueprint opacity-40" />
      </div>

      {/* ================= header ================= */}
      <header className="relative z-20 h-14 shrink-0 glass border-b border-slate-800/70 flex items-center gap-4 px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-[0_0_22px_rgba(16,185,129,0.45)] shrink-0">
            <Grid3x3 className="w-4 h-4 text-slate-950" />
          </div>
          <div className="leading-tight hidden sm:block">
            <h1 className="font-display font-bold text-[13px] text-white tracking-tight">
              SeqCarver <span className="text-emerald-400 text-glow-emerald">Studio</span>
            </h1>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.22em]">Front-Page Advert Panels</p>
          </div>
        </div>

        {/* grid mode segmented control */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-1 shadow-inner">
          {(["3x3", "4x4"] as GridMode[]).map((m) => {
            const active = gridMode === m;
            return (
              <button
                key={m}
                onClick={() => setGridMode(m)}
                className="relative px-4 py-1.5 rounded-full cursor-pointer"
                title={m === "3x3" ? "Revert to 3×3 layout" : "Expand to 4×4 layout"}
              >
                {active && (
                  <motion.span
                    layoutId="gridmode-pill"
                    className="absolute inset-0 bg-emerald-500 rounded-full shadow-[0_0_18px_rgba(16,185,129,0.5)]"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center gap-1.5 text-[11px] font-bold font-mono transition-colors",
                    active ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {m === "3x3" ? <Grid3x3 className="w-3 h-3" /> : <LayoutGrid className="w-3 h-3" />}
                  {m === "3x3" ? "3×3" : "4×4"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setPoolOpen((p) => !p)}
            title="Toggle storyboard pool"
            className={cn(
              "p-2 rounded-lg border transition-all cursor-pointer",
              poolOpen
                ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModal((m) => ({ open: true, tab: m.tab }))}
            title={`Open inspector for Panel ${selectedSlot}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition-all cursor-pointer shadow-[0_0_18px_rgba(16,185,129,0.35)] active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Control Deck</span>
          </button>
        </div>
      </header>

      {/* ================= main ================= */}
      <main className="relative z-10 flex-1 flex min-h-0">
        <section className="flex-1 flex flex-col min-w-0 min-h-0 p-4 gap-3">
          {/* stage toolbar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
                Live Preview
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {cols}×{cols} · {panelCount} slots
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => {
                  applySpread(
                    Array.from({ length: panelCount }, (_, i) => i + 1),
                    originalSpreadImage,
                    "none"
                  );
                  toast(`Master re-spread across ${panelCount} panels`);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-[10px] font-bold transition-all cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Spread Master</span>
              </button>
              <button
                onClick={() => openModal(selectedSlot)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-[10px] font-bold transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inspect Panel {selectedSlot}</span>
              </button>
              <button
                onClick={() => {
                  resetAllPanels();
                  toast("Board cleared — all panels reset", "info");
                }}
                title="Reset all panels"
                className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-300 hover:border-rose-500/40 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* the board */}
          <GridStage
            cols={cols}
            panelCount={panelCount}
            placement={placement}
            panels={panels}
            selectedSlot={selectedSlot}
            disableActions={disableActions}
            onSelectSlot={setSelectedSlot}
            onOpenModal={openModal}
            onToggleRotate={toggleRotate}
            onOpenLink={openLink}
            onSwapSlots={(a, b) => {
              swapSlots(a, b);
              toast(`Swapped Panel ${a} and Panel ${b} — watch them glide`);
            }}
          />

          {/* status strip */}
          <div className="glass border border-slate-800/70 rounded-xl px-3.5 py-2 flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold shrink-0">
              <MousePointerClick className="w-3 h-3 text-emerald-400" />
              Panel {selectedSlot} selected
              <span className="hidden lg:inline text-slate-500 font-normal">· double-click a tile to inspect</span>
            </span>
            <span className="hidden md:flex items-center gap-3 text-slate-500">
              {selectedPanel.rotation.length > 0 && (
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-purple-400" />
                  {selectedPanel.rotation.length} frames {selectedPanel.rotating ? "· live" : ""}
                </span>
              )}
              {selectedPanel.link.url && (
                <span className="flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-cyan-400" /> linked
                </span>
              )}
              {selectedPanel.parallax && (
                <span className="flex items-center gap-1">
                  <Box className="w-3 h-3 text-purple-400" /> 2.5D
                </span>
              )}
              {selectedPanel.spread && <span className="text-emerald-400/80 font-mono">spread slice</span>}
            </span>
            <span className="ml-auto flex items-center gap-3 text-slate-500 shrink-0">
              <span className="hidden sm:flex items-center gap-1">
                <ArrowDownUp className="w-3 h-3 text-amber-400" />
                sort: {sortMode === "none" ? "original" : sortMode.replace(/-/g, " ")}
              </span>
              <span className="font-mono">{slices.length} slices</span>
              <span className="hidden xl:inline text-slate-600">Alt+Click any control to re-skin it</span>
            </span>
          </div>
        </section>

        <AnimatePresence initial={false}>
          {poolOpen && (
            <motion.div
              key="pool-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="shrink-0 overflow-hidden flex min-h-0"
            >
              <PoolPanel
                slices={slices}
            metas={metas}
            sortMode={sortMode}
            groupMode={groupMode}
            groupFilter={groupFilter}
            groups={groups}
            selectedSlot={selectedSlot}
            onSortMode={setSortMode}
            onGroupMode={handleGroupMode}
            onGroupFilter={setGroupFilter}
            onAssign={(slice) => {
              assignImage(selectedSlot, slice.url);
              toast(`"${slice.name}" loaded into Panel ${selectedSlot}`);
            }}
                onOpenSorter={() => setModal({ open: true, tab: "asset_sorter" })}
                onClose={() => setPoolOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================= floating control deck ================= */}
      <AnimatePresence>
        {modal.open && (
          <AdvertPanelFullScreenModal
            key="control-deck"
            ctx={ctx}
            initialTab={modal.tab}
            onClose={() => setModal((m) => ({ ...m, open: false }))}
          />
        )}
      </AnimatePresence>

      <Toasts items={toasts} />
      <CustomizationHost />
    </div>
  );
}
