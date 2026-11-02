// ─────────────────────────────────────────────────────────────
// Storyboard Pool sidebar — shows slices in their sorted /
// grouped order; clicking assigns an asset to the selected slot.
// ─────────────────────────────────────────────────────────────
import React, { useMemo } from "react";
import { Layers, ArrowDownUp, MousePointerClick, X, Filter } from "lucide-react";
import { cn } from "../utils/cn";
import type { SliceAsset, SliceMeta, SortMode, GroupMode, AssetGroup } from "../types";
import { sortSlices, groupIdOf, aspectLabel, aspectCategory } from "../utils/sorter";

interface PoolPanelProps {
  slices: SliceAsset[];
  metas: Record<string, SliceMeta>;
  sortMode: SortMode;
  groupMode: GroupMode;
  groupFilter: string | null;
  groups: AssetGroup[];
  selectedSlot: number;
  onSortMode: (m: SortMode) => void;
  onGroupMode: (m: GroupMode) => void;
  onGroupFilter: (g: string | null) => void;
  onAssign: (slice: SliceAsset) => void;
  onOpenSorter: () => void;
  onClose: () => void;
}

export const PoolPanel: React.FC<PoolPanelProps> = ({
  slices,
  metas,
  sortMode,
  groupMode,
  groupFilter,
  groups,
  selectedSlot,
  onSortMode,
  onGroupMode,
  onGroupFilter,
  onAssign,
  onOpenSorter,
  onClose,
}) => {
  const display = useMemo(() => {
    let list = sortSlices(slices, metas, sortMode);
    if (groupMode !== "none" && groupFilter) {
      list = list.filter((s) => groupIdOf(metas, s.url, groupMode) === groupFilter);
    }
    return list;
  }, [slices, metas, sortMode, groupMode, groupFilter]);

  return (
    <aside className="w-72 shrink-0 glass border-l border-slate-800/70 flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-3.5 py-3 border-b border-slate-800/70">
        <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
          <Layers className="w-3.5 h-3.5 text-indigo-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-[12px] font-bold text-slate-100 leading-tight">Storyboard Pool</h2>
          <p className="text-[9px] text-slate-500 font-mono">{display.length} / {slices.length} slices</p>
        </div>
        <button
          onClick={onOpenSorter}
          title="Open Asset Sorter Studio"
          className="p-1.5 rounded-lg text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/40 transition-all cursor-pointer"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          title="Hide pool"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* sort / group selects */}
      <div className="px-3 pt-2.5 pb-2 space-y-1.5 border-b border-slate-800/50">
        <select
          value={sortMode}
          onChange={(e) => onSortMode(e.target.value as SortMode)}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-[10px] px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/70 cursor-pointer"
        >
          <option value="none">Sort · Original order</option>
          <option value="aspect-shape">Sort · Shape clusters</option>
          <option value="aspect-wide-tall">Sort · Wide → Tall</option>
          <option value="aspect-tall-wide">Sort · Tall → Wide</option>
          <option value="color-rainbow">Sort · Rainbow spectrum</option>
          <option value="color-family">Sort · Color family</option>
          <option value="color-warm-cool">Sort · Warm → Cool</option>
          <option value="color-light-dark">Sort · Light → Dark</option>
          <option value="color-dark-light">Sort · Dark → Light</option>
        </select>
        <select
          value={groupMode}
          onChange={(e) => {
            onGroupMode(e.target.value as GroupMode);
            onGroupFilter(null);
          }}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-[10px] px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/70 cursor-pointer"
        >
          <option value="none">Group · None</option>
          <option value="aspect-category">Group · By aspect</option>
          <option value="color-family">Group · By color family</option>
        </select>

        {groups.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            <button
              onClick={() => onGroupFilter(null)}
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-colors cursor-pointer flex items-center gap-1",
                !groupFilter
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600"
              )}
            >
              <Filter className="w-2.5 h-2.5" /> All
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => onGroupFilter(groupFilter === g.id ? null : g.id)}
                className={cn(
                  "px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-colors cursor-pointer flex items-center gap-1",
                  groupFilter === g.id
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600"
                )}
              >
                {g.colorSwatch && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: g.colorSwatch }} />
                )}
                {g.title} ({g.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* slice grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {display.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10">
            <Layers className="w-6 h-6 text-slate-700" />
            <p className="text-[10px] text-slate-500">No slices match this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {display.map((slice) => {
              const meta = metas[slice.url];
              return (
                <button
                  key={slice.url}
                  onClick={() => onAssign(slice)}
                  title={`Assign "${slice.name}" to Panel ${selectedSlot}`}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-400/70 bg-black/50 text-left transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={slice.url}
                      alt={slice.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5 pt-4">
                    <p className="text-[9px] font-bold text-white truncate leading-tight">{slice.name}</p>
                    <p className="text-[8px] font-mono text-slate-400">
                      {meta ? `${aspectLabel(meta)} · ${aspectCategory(meta)}` : "…"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-slate-800/70 flex items-center gap-1.5 text-[9px] text-slate-500">
        <MousePointerClick className="w-3 h-3 text-indigo-400 shrink-0" />
        <span>
          Click a slice to load it into <span className="text-indigo-300 font-bold">Panel {selectedSlot}</span>
        </span>
      </div>
    </aside>
  );
};
