// ─────────────────────────────────────────────────────────────
// Advert Panel Inspector — floating, draggable, resizable,
// minimizable control deck hosting 10 studio tabs.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  X,
  Minus,
  LayoutGrid,
  Grid3x3,
  ArrowDownUp,
  Box,
  Sparkles,
  RotateCw,
  Link2,
  ArrowLeftRight,
  Scissors,
  Palette,
  ChevronLeft,
  ChevronRight,
  Shrink,
  Expand,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { CustomizableButton } from "../Customizable";
import type { AdvertPanelTab } from "../../types";
import { allSlots, type ModalCtx } from "./ctx";
import { SpreadTab, SpreadStudioTab, SorterTab } from "./tabsA";
import { ParallaxTab, MediaTab, RotationTab } from "./tabsB";
import { LinkTab, SwapTab, ActionsTab, StylesTab } from "./tabsC";

interface TabDef {
  id: AdvertPanelTab;
  label: string;
  icon: ReactNode;
  accent: string;
}

const TABS: TabDef[] = [
  { id: "spread", label: "Spread", icon: <LayoutGrid className="text-slate-300" />, accent: "" },
  { id: "spread_studio", label: "Spread Studio", icon: <Grid3x3 className="text-cyan-400" />, accent: "" },
  { id: "asset_sorter", label: "Asset Sorter", icon: <ArrowDownUp className="text-amber-400" />, accent: "" },
  { id: "parallax", label: "2.5D Parallax", icon: <Box className="text-purple-400" />, accent: "" },
  { id: "media", label: "Storyboard Media", icon: <Sparkles className="text-indigo-400" />, accent: "" },
  { id: "rotation", label: "Rotation Series", icon: <RotateCw className="text-purple-400" />, accent: "" },
  { id: "link", label: "Links & FX", icon: <Link2 className="text-cyan-400" />, accent: "" },
  { id: "swap", label: "Swap Panels", icon: <ArrowLeftRight className="text-orange-400" />, accent: "" },
  { id: "actions", label: "Actions & Grid", icon: <Scissors className="text-rose-400" />, accent: "" },
  { id: "styles", label: "Style Dial", icon: <Palette className="text-pink-400" />, accent: "" },
];

const TAB_COMPONENTS: Record<AdvertPanelTab, ComponentType<{ ctx: ModalCtx }>> = {
  spread: SpreadTab,
  spread_studio: SpreadStudioTab,
  asset_sorter: SorterTab,
  parallax: ParallaxTab,
  media: MediaTab,
  rotation: RotationTab,
  link: LinkTab,
  swap: SwapTab,
  actions: ActionsTab,
  styles: StylesTab,
};

interface Props {
  ctx: ModalCtx;
  initialTab?: AdvertPanelTab;
  onClose: () => void;
}

export const AdvertPanelFullScreenModal: React.FC<Props> = ({ ctx, initialTab = "spread", onClose }) => {
  const [activeTab, setActiveTab] = useState<AdvertPanelTab>(initialTab);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(() => ({
    width: Math.min(typeof window !== "undefined" ? window.innerWidth - 32 : 1160, 1160),
    height: Math.min(typeof window !== "undefined" ? window.innerHeight - 40 : 720, 720),
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, startW: 1000, startH: 700 });

  /* escape closes */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  /* drag */
  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent) =>
      setPosition({ x: dragRef.current.posX + e.clientX - dragRef.current.startX, y: dragRef.current.posY + e.clientY - dragRef.current.startY });
    const up = () => setIsDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [isDragging]);

  /* resize */
  useEffect(() => {
    if (!isResizing) return;
    const move = (e: MouseEvent) =>
      setSize({
        width: Math.max(480, resizeRef.current.startW + e.clientX - resizeRef.current.startX),
        height: Math.max(420, resizeRef.current.startH + e.clientY - resizeRef.current.startY),
      });
    const up = () => setIsResizing(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [isResizing]);

  const isInteractiveTarget = (t: HTMLElement) =>
    !!(t.closest("button") || t.closest("input") || t.closest("select") || t.closest("a") || t.closest("textarea"));

  if (isMinimized) {
    return (
      <div className="fixed top-16 right-4 z-[95]">
        <motion.button
          initial={{ opacity: 0, y: -8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          onClick={() => setIsMinimized(false)}
          className="px-3 py-1.5 rounded-xl bg-[#090f1d]/95 hover:bg-[#0f172a] border border-emerald-500/50 text-emerald-300 font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <Grid3x3 className="w-3.5 h-3.5" />
          Panel {ctx.selectedSlot} Inspector
        </motion.button>
      </div>
    );
  }

  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const effSize = isCompact
    ? { width: Math.min(size.width, 620), height: Math.min(size.height, 560) }
    : size;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.18 } }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="pointer-events-auto flex flex-col rounded-2xl overflow-hidden border border-slate-700/70 glass shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] relative"
        style={{
          width: effSize.width,
          height: effSize.height,
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {/* top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 shrink-0" />

        {/* header */}
        <div
          onMouseDown={(e) => {
            if (isInteractiveTarget(e.target as HTMLElement)) return;
            e.preventDefault();
            setIsDragging(true);
            dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y };
          }}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 border-b border-slate-800 select-none shrink-0",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40">
            <Grid3x3 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <h2 className="font-display text-[12px] font-bold text-slate-100 truncate">
              Panel {ctx.selectedSlot} Inspector
            </h2>
            <p className="text-[8.5px] text-slate-500 font-mono truncate">
              Advert Panel Console · live {ctx.cols}×{ctx.cols} grid · drag header to move
            </p>
          </div>
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[8.5px]">
            {ctx.panelCount} slots
          </span>
          <button
            title={isCompact ? "Expand deck" : "Compact deck"}
            onClick={(e) => {
              e.stopPropagation();
              setIsCompact((p) => !p);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isCompact ? <Expand className="w-3.5 h-3.5" /> : <Shrink className="w-3.5 h-3.5" />}
          </button>
          <button
            title="Minimize to dock"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            title="Close (Esc)"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* tab nav */}
        <div className="flex items-center gap-1 px-2 py-1.5 bg-[#040814] border-b border-slate-800 overflow-x-auto scrollbar-none shrink-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <CustomizableButton
                key={tab.id}
                buttonId={`ad_panel_tab_${tab.id}`}
                defaultLabel={tab.label}
                defaultIcon={tab.icon}
                forceZeroText
                title={tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-1.5 px-2.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center shrink-0",
                  isActive
                    ? "bg-[#00c988] text-slate-950 shadow-md ring-1 ring-emerald-400/50 [&_svg]:text-slate-950!"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/60"
                )}
              />
            );
          })}
          <span className="ml-auto pl-2 pr-1 hidden md:block text-[9px] font-mono text-slate-600 shrink-0">
            {TABS.find((t) => t.id === activeTab)?.label}
          </span>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-3 bg-[#04070f] min-h-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="max-w-2xl mx-auto"
          >
            <ActiveComponent ctx={ctx} />
          </motion.div>
        </div>

        {/* footer slot stepper */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 border-t border-slate-800 bg-[#040814] shrink-0">
          <button
            disabled={ctx.selectedSlot <= 1}
            onClick={() => ctx.selectSlot(ctx.selectedSlot - 1)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-none">
            {allSlots(ctx.panelCount).map((s) => (
              <button
                key={s}
                onClick={() => ctx.selectSlot(s)}
                className={cn(
                  "w-6 h-6 shrink-0 rounded-md font-mono text-[9px] font-bold border transition-all cursor-pointer",
                  s === ctx.selectedSlot
                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            disabled={ctx.selectedSlot >= ctx.panelCount}
            onClick={() => ctx.selectSlot(ctx.selectedSlot + 1)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] font-mono text-slate-500 shrink-0">
            Slot {ctx.selectedSlot}/{ctx.panelCount}
          </span>
        </div>

        {/* resize handle */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
            resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: size.width, startH: size.height };
          }}
          className="absolute bottom-0.5 right-0.5 w-5 h-5 cursor-nwse-resize group z-10"
          title="Drag to resize"
        >
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-600 group-hover:border-emerald-400 rounded-br transition-colors" />
        </div>
      </motion.div>
    </div>
  );
};
