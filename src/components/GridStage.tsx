// ─────────────────────────────────────────────────────────────
// GridStage — positions every panel from slot math and lets
// framer-motion spring-animate x/y/width/height. Toggling the
// grid between 3×3 and 4×4 therefore glides existing panels to
// their new cells while extra panels bloom in / fold out.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Tile } from "./Tile";
import { createPanel, type PanelData } from "../types";

interface GridStageProps {
  cols: number;
  panelCount: number;
  placement: number[]; // slot index (0-based) -> panelId
  panels: Record<number, PanelData>;
  selectedSlot: number;
  disableActions: boolean;
  onSelectSlot: (slot: number) => void;
  onOpenModal: (slot: number) => void;
  onToggleRotate: (slot: number) => void;
  onOpenLink: (url: string, target: string) => void;
  onSwapSlots: (a: number, b: number) => void;
}

export const GridStage: React.FC<GridStageProps> = ({
  cols,
  panelCount,
  placement,
  panels,
  selectedSlot,
  disableActions,
  onSelectSlot,
  onOpenModal,
  onToggleRotate,
  onOpenLink,
  onSwapSlots,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState(560);
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const [overSlot, setOverSlot] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDim(Math.max(300, Math.min(r.width, r.height)));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const cell = dim / cols;

  const handleDropOn = (slot: number) => {
    if (dragSlot !== null && dragSlot !== slot) onSwapSlots(dragSlot, slot);
    setDragSlot(null);
    setOverSlot(null);
  };

  const handleDragClear = () => {
    setDragSlot(null);
    setOverSlot(null);
  };

  return (
    <div ref={wrapRef} className="flex-1 min-w-0 min-h-0 flex items-center justify-center relative">
      {/* ambient glow behind the board */}
      <div className="absolute w-[70%] h-[70%] rounded-full bg-emerald-500/[0.07] blur-[110px] pointer-events-none animate-drift" />
      <div className="absolute w-[45%] h-[45%] rounded-full bg-cyan-500/[0.05] blur-[90px] pointer-events-none" />

      <div
        className="relative rounded-[26px] border border-slate-800/80 bg-[#060b16]/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{ width: dim, height: dim }}
      >
        {/* blueprint texture */}
        <div className="absolute inset-0 bg-blueprint opacity-60 pointer-events-none" />

        <AnimatePresence>
          {Array.from({ length: panelCount }, (_, i) => {
            const slot = i + 1;
            const panelId = placement[i] ?? slot;
            const data = panels[panelId] || createPanel();
            const col = i % cols;
            const row = Math.floor(i / cols);
            return (
              <Tile
                key={panelId}
                slot={slot}
                panelId={panelId}
                data={data}
                x={col * cell}
                y={row * cell}
                cell={cell}
                selected={selectedSlot === slot}
                isDragOver={overSlot === slot && dragSlot !== null && dragSlot !== slot}
                disableActions={disableActions}
                onSelect={onSelectSlot}
                onOpenModal={onOpenModal}
                onToggleRotate={onToggleRotate}
                onOpenLink={onOpenLink}
                onDragStartSlot={setDragSlot}
                onDragEnterSlot={setOverSlot}
                onDropSlot={handleDropOn}
                onDragClear={handleDragClear}
              />
            );
          })}
        </AnimatePresence>

        {/* frame corners */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg pointer-events-none" />
      </div>
    </div>
  );
};
