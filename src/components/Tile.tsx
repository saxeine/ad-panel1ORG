import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Maximize2, RotateCw, ExternalLink, GripVertical, Grid3x3, Box, Link2 } from "lucide-react";
import { cn } from "../utils/cn";
import type { PanelData } from "../types";
import { sliceBackgroundStyle } from "../utils/spread";

export interface TileProps {
  slot: number;
  panelId: number;
  data: PanelData;
  x: number;
  y: number;
  cell: number;
  selected: boolean;
  isDragOver: boolean;
  disableActions: boolean;
  onSelect: (slot: number) => void;
  onOpenModal: (slot: number) => void;
  onToggleRotate: (slot: number) => void;
  onOpenLink: (url: string, target: string) => void;
  onDragStartSlot: (slot: number) => void;
  onDragEnterSlot: (slot: number) => void;
  onDropSlot: (slot: number) => void;
  onDragClear: () => void;
}

export const Tile: React.FC<TileProps> = ({
  slot,
  data,
  x,
  y,
  cell,
  selected,
  isDragOver,
  disableActions,
  onSelect,
  onOpenModal,
  onToggleRotate,
  onOpenLink,
  onDragStartSlot,
  onDragEnterSlot,
  onDropSlot,
  onDragClear,
}) => {
  const frames = data.rotation;
  const rotating = data.rotating && frames.length > 1;
  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    if (!rotating) return;
    const t = window.setInterval(
      () => setFrameIdx((p) => (p + 1) % frames.length),
      Math.max(1, data.rotationInterval) * 1000
    );
    return () => window.clearInterval(t);
  }, [rotating, frames.length, data.rotationInterval]);

  useEffect(() => {
    if (frameIdx >= Math.max(1, frames.length)) setFrameIdx(0);
  }, [frames.length, frameIdx]);

  const baseImage = rotating ? frames[frameIdx % frames.length] : data.image;
  const hoverFx = data.link.hoverEffect;
  const hasContent = !!(baseImage || data.spread);
  const borderColor = data.style.borderColor || "rgba(30,41,59,0.85)";
  const textColor = data.style.textColor || "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, x, y, width: cell, height: cell }}
      animate={{ opacity: 1, scale: 1, x, y, width: cell, height: cell }}
      exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
      transition={{ type: "spring", stiffness: 300, damping: 31, mass: 0.9 }}
      className="absolute left-0 top-0"
      style={{ zIndex: isDragOver ? 30 : selected ? 20 : 10 }}
    >
      <div className="w-full h-full" style={{ padding: cell > 130 ? 6 : 4 }}>
        <div
          onClick={() => onSelect(slot)}
          onDoubleClick={() => onOpenModal(slot)}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => {
            e.preventDefault();
            onDragEnterSlot(slot);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDropSlot(slot);
          }}
          className={cn(
            "group relative w-full h-full rounded-2xl overflow-hidden border bg-[#0a1120] cursor-pointer transition-shadow duration-300",
            selected && "ring-2 ring-emerald-400/90 shadow-[0_0_36px_rgba(16,185,129,0.28)]",
            isDragOver && "ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.35)]"
          )}
          style={{
            borderColor,
            background: data.style.backgroundColor || undefined,
          }}
        >
          {/* ---------- visual content (spin-capable wrapper) ---------- */}
          <div
            className={cn(
              "absolute inset-0",
              hoverFx === "spin" &&
                "transition-transform duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(360deg)]"
            )}
          >
            {rotating && baseImage ? (
              <motion.img
                key={frameIdx}
                src={baseImage}
                alt={`Panel ${slot} frame ${frameIdx + 1}`}
                initial={{ opacity: 0.15, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            ) : data.spread ? (
              <div
                className="absolute inset-0"
                style={{ ...sliceBackgroundStyle(data.spread), filter: data.spread.filter }}
              />
            ) : baseImage ? (
              <img
                src={baseImage}
                alt={`Panel ${slot}`}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 border border-dashed border-slate-800/80 rounded-2xl m-1">
                <Grid3x3 className="w-5 h-5 text-slate-700" />
                <span className="font-mono text-[10px] text-slate-600">Slot {slot}</span>
              </div>
            )}

            {/* hover swap image */}
            {hoverFx === "change-image" && data.link.hoverImage && (
              <img
                src={data.link.hoverImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                draggable={false}
              />
            )}

            {/* readability gradient */}
            {hasContent && (
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
            )}
          </div>

          {/* ---------- slot chip ---------- */}
          <span
            className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-black/65 backdrop-blur-sm font-mono text-[9px] font-bold border border-white/10"
            style={{ color: textColor }}
          >
            #{slot}
          </span>

          {/* ---------- status badges ---------- */}
          <div className="absolute top-1.5 right-1.5 z-10 flex gap-1">
            {data.parallax && (
              <span title="2.5D Parallax applied">
                <Box className="w-3.5 h-3.5 text-purple-300 drop-shadow" />
              </span>
            )}
            {data.link.url && (
              <span title="Linked panel">
                <Link2 className="w-3.5 h-3.5 text-cyan-300 drop-shadow" />
              </span>
            )}
            {frames.length > 0 && (
              <span
                title={`${frames.length} rotation frames`}
                className="flex items-center gap-0.5 px-1 rounded bg-black/60 font-mono text-[8px] text-purple-300 border border-purple-400/30"
              >
                <RotateCw className={cn("w-2.5 h-2.5", rotating && "animate-spin [animation-duration:2.5s]")} />
                {frames.length}
              </span>
            )}
          </div>

          {/* ---------- hover toolbar ---------- */}
          {!disableActions && (
            <div className="absolute inset-x-0 bottom-1.5 z-10 flex items-center justify-center gap-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              <button
                title="Open inspector (or double-click)"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(slot);
                }}
                className="p-1.5 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-slate-200 hover:text-emerald-300 hover:border-emerald-400/50 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              {frames.length > 0 && (
                <button
                  title={data.rotating ? "Pause rotation" : "Play rotation"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRotate(slot);
                  }}
                  className="p-1.5 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-slate-200 hover:text-purple-300 hover:border-purple-400/50 transition-colors cursor-pointer"
                >
                  <RotateCw className={cn("w-3 h-3", rotating && "animate-spin [animation-duration:2s]")} />
                </button>
              )}
              {data.link.url && (
                <button
                  title={`Open ${data.link.url}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLink(data.link.url, data.link.target);
                  }}
                  className="p-1.5 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-slate-200 hover:text-cyan-300 hover:border-cyan-400/50 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              <div
                title="Drag to swap panel"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(slot));
                  onDragStartSlot(slot);
                }}
                onDragEnd={onDragClear}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-black/70 backdrop-blur border border-white/10 text-slate-200 hover:text-amber-300 hover:border-amber-400/50 transition-colors cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
