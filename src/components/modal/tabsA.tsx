// ─────────────────────────────────────────────────────────────
// Inspector tabs A — Spread engine, Spread Studio, Asset Sorter.
// All are grid-aware: presets & slot pickers adapt to 3×3 / 4×4.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Upload, Grid3x3, Check, ArrowDownUp, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { CustomizableButton, CustomizableLabel } from "../Customizable";
import { SPREAD_EFFECTS, spreadPresets } from "../../utils/spread";
import type { SortMode, GroupMode } from "../../types";
import { allSlots, readImageFile, type ModalCtx } from "./ctx";

/* ================= SPREAD TAB ================= */

export const SpreadTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const target = ctx.originalSpreadImage || ctx.panel.image;
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadSpreadRef = useRef<HTMLInputElement>(null);
  const presets = spreadPresets(ctx.cols);

  return (
    <div className="space-y-2.5">
      {/* master target card */}
      <div className="bg-[#030d1a] p-2.5 rounded-2xl border border-emerald-500/35 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
          <CustomizableLabel
            labelId="ad_panel_label_master_badge"
            defaultLabel="Master"
            className="text-[8.5px] font-mono text-emerald-400 font-bold bg-[#042922] border border-emerald-500/30 px-2 py-0.5 rounded"
          />
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-[#020713] rounded-xl border border-emerald-500/25">
          <div className="w-9 h-9 rounded-lg border border-emerald-500/40 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center">
            {target ? (
              <img src={target} alt="Master Target" className="w-full h-full object-cover" />
            ) : (
              <Grid3x3 className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CustomizableLabel
              labelId="ad_panel_label_target_spread_image"
              defaultLabel="Target Spread Image"
              className="text-[10px] font-bold text-emerald-400 block truncate leading-tight"
            />
            <CustomizableLabel
              labelId="ad_panel_label_target_spread_desc"
              defaultLabel={`Un-sliced source · feeds ${ctx.cols}×${ctx.cols}`}
              className="text-[8px] text-slate-400 leading-tight truncate mt-0.5 block"
            />
          </div>
          <CustomizableButton
            buttonId="ad_panel_btn_change_target_image"
            defaultLabel="Change"
            defaultIcon={<Upload />}
            onClick={() => fileRef.current?.click()}
            className="px-2.5 py-1 bg-[#062c28] hover:bg-[#0a3f3a] text-emerald-300 border border-emerald-500/40 rounded-lg text-[8.5px] font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = await readImageFile(f);
                ctx.setOriginalSpreadImage(url);
                ctx.toast("New target image set as spread source");
              }
              e.target.value = "";
            }}
          />
        </div>

        <CustomizableButton
          buttonId="ad_panel_btn_spread_target_grid"
          defaultLabel={`Spread Target Image Across ${ctx.cols}×${ctx.cols}`}
          defaultIcon={<LayoutGrid />}
          onClick={() => {
            if (!target) return ctx.toast("Set a target image first", "error");
            ctx.applySpread(allSlots(ctx.panelCount), target, "none");
            ctx.toast(`Spread target across all ${ctx.panelCount} panels`);
          }}
          className="w-full py-2 px-3 bg-[#00c988] hover:bg-[#00b077] text-slate-950 font-black text-[10px] rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] [&_svg]:text-slate-950"
        />

        <CustomizableButton
          buttonId="ad_panel_btn_upload_spread_grid"
          defaultLabel="Upload New Image & Spread"
          defaultIcon={<Upload />}
          onClick={() => uploadSpreadRef.current?.click()}
          className="w-full py-2 px-3 bg-[#072d2e] hover:bg-[#0b3c3d] text-[#2dd4bf] border border-teal-500/40 font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
        />
        <input
          ref={uploadSpreadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              const url = await readImageFile(f);
              ctx.setOriginalSpreadImage(url);
              ctx.applySpread(allSlots(ctx.panelCount), url, "none");
              ctx.toast(`Uploaded target and spread across ${ctx.panelCount} panels`);
            }
            e.target.value = "";
          }}
        />
      </div>

      {/* quick spread n-box */}
      <div className="bg-[#030d1a] p-2.5 rounded-2xl border border-slate-800/90 space-y-2">
        <div className="flex items-center justify-between pb-0.5">
          <CustomizableLabel
            labelId="ad_panel_label_quick_spread_nbox"
            defaultLabel={`QUICK SPREAD · ${ctx.cols}×${ctx.cols} GRID`}
            className="text-[9.5px] font-bold text-slate-100 uppercase tracking-wider block"
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {presets.map((p) => (
            <CustomizableButton
              key={`n-spread-${p.label}`}
              buttonId={`ad_panel_btn_n_spread_${p.boxes.length}`}
              defaultLabel={`${p.boxes.length} Panels`}
              onClick={() => {
                if (!target) return ctx.toast("Set a target image first", "error");
                ctx.applySpread(p.boxes, target, "none");
                ctx.toast(`Spread target across ${p.boxes.length} panels`);
              }}
              className="py-2 px-1 rounded-xl border border-slate-700/80 bg-[#0c1524] hover:bg-emerald-950/60 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 font-bold text-[9.5px] transition-all cursor-pointer justify-center flex"
            />
          ))}
        </div>
        <p className="text-[8px] text-slate-500 leading-snug">
          Presets follow the active grid — switch to 4×4 and targets adapt to 16 slots automatically.
        </p>
      </div>
    </div>
  );
};

/* ================= SPREAD STUDIO TAB ================= */

export const SpreadStudioTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const [slots, setSlots] = useState<number[]>(() => allSlots(ctx.panelCount));
  const [effect, setEffect] = useState("none");
  const [stretchX, setStretchX] = useState(1);
  const [stretchY, setStretchY] = useState(1);
  const [lockAspect, setLockAspect] = useState(true);
  const [customImg, setCustomImg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // re-seed selection when the grid geometry changes
  useEffect(() => {
    setSlots((prev) => prev.filter((s) => s <= ctx.panelCount));
  }, [ctx.panelCount]);

  const source = customImg || ctx.originalSpreadImage || ctx.panel.image;
  const filter = SPREAD_EFFECTS.find((f) => f.id === effect)?.filter || "none";
  const presets = spreadPresets(ctx.cols);

  const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((v) => b.includes(v));

  return (
    <div className="space-y-2.5">
      <div className="bg-[#030d1a] p-2.5 rounded-2xl border border-cyan-500/35 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
          <div className="flex items-center gap-1.5">
            <Grid3x3 className="w-3.5 h-3.5 text-cyan-400" />
            <CustomizableLabel
              labelId="ad_panel_label_spread_studio_title"
              defaultLabel="Spread Studio"
              className="text-[9.5px] font-bold text-cyan-300 uppercase tracking-wider"
            />
          </div>
          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded">
            {slots.length} Panels Selected
          </span>
        </div>

        {/* source picker */}
        <div className="flex items-center gap-2 p-1.5 bg-[#020713] rounded-xl border border-cyan-500/25">
          <div className="w-9 h-9 rounded-lg border border-cyan-500/40 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center">
            {source ? (
              <img src={source} alt="Spread source" className="w-full h-full object-cover" />
            ) : (
              <Grid3x3 className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9.5px] font-bold text-cyan-400 block truncate">Spread Source Image</span>
            <span className="text-[7.5px] text-slate-400 block truncate">Target image to carve & distribute</span>
          </div>
          <CustomizableButton
            buttonId="spread_studio_change_img_btn"
            defaultLabel="Change"
            defaultIcon={<Upload />}
            onClick={() => fileRef.current?.click()}
            className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold text-[8.5px] rounded-lg cursor-pointer transition-colors flex items-center gap-1"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                setCustomImg(await readImageFile(f));
                ctx.toast("Custom spread image loaded");
              }
              e.target.value = "";
            }}
          />
        </div>

        {/* presets */}
        <div className="space-y-1">
          <span className="text-[8.5px] text-slate-400 font-semibold block uppercase tracking-wider">
            Spread Presets ({ctx.cols}×{ctx.cols}):
          </span>
          <div className="grid grid-cols-3 gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setSlots(p.boxes)}
                className={cn(
                  "py-1 px-1.5 rounded-lg text-[8.5px] font-bold border transition-all cursor-pointer text-center",
                  sameSet(slots, p.boxes)
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-sm"
                    : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/60"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* slot picker — grid follows cols */}
        <div className="space-y-1 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider">
              Target Slots (1–{ctx.panelCount}):
            </span>
            <div className="flex gap-1 text-[8px]">
              <button
                type="button"
                onClick={() => setSlots(allSlots(ctx.panelCount))}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                All
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => setSlots([])}
                className="text-slate-400 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
          <div
            className="grid gap-1 p-1 bg-[#020617] rounded-xl border border-slate-800/80"
            style={{ gridTemplateColumns: `repeat(${ctx.cols}, minmax(0,1fr))` }}
          >
            {allSlots(ctx.panelCount).map((s) => {
              const on = slots.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setSlots((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].sort((a, b) => a - b)))
                  }
                  className={cn(
                    "py-1.5 rounded-lg text-[9px] font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-1",
                    on
                      ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm font-black"
                      : "bg-slate-900/60 text-slate-500 border-slate-800 hover:border-slate-700"
                  )}
                >
                  {on && <Check className="w-2.5 h-2.5" />}
                  <span>#{s}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* fx */}
        <div className="space-y-1 pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold block uppercase tracking-wider">
            Filter / FX Preset:
          </span>
          <div className="grid grid-cols-4 gap-1">
            {SPREAD_EFFECTS.map((fx) => {
              const FxIcon = fx.icon;
              const on = effect === fx.id;
              return (
                <button
                  key={fx.id}
                  type="button"
                  onClick={() => setEffect(fx.id)}
                  className={cn(
                    "py-1 px-1 rounded-md text-[8px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1",
                    on
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800"
                  )}
                >
                  <FxIcon className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{fx.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* stretch */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider">
              Stretch / Aspect Scale:
            </span>
            <button
              type="button"
              onClick={() => setLockAspect((p) => !p)}
              className={cn(
                "text-[8px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer",
                lockAspect ? "bg-cyan-950 text-cyan-300 border-cyan-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
              )}
            >
              {lockAspect ? "Aspect Locked" : "Free Stretch"}
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] text-slate-400">
              <span>Stretch X:</span>
              <span className="font-mono text-cyan-300">{stretchX.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={stretchX}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setStretchX(v);
                if (lockAspect) setStretchY(v);
              }}
              className="w-full range-cyan"
            />
          </div>
          {!lockAspect && (
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-slate-400">
                <span>Stretch Y:</span>
                <span className="font-mono text-cyan-300">{stretchY.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={stretchY}
                onChange={(e) => setStretchY(parseFloat(e.target.value))}
                className="w-full range-cyan"
              />
            </div>
          )}
        </div>

        <div className="pt-1.5 border-t border-slate-800">
          <CustomizableButton
            buttonId="spread_studio_apply_action"
            defaultLabel="Apply Spread to Selected Panels"
            defaultIcon={<Check />}
            onClick={() => {
              if (!source) return ctx.toast("Upload an image for Spread Studio first", "error");
              if (slots.length === 0) return ctx.toast("Select at least one target slot", "error");
              ctx.applySpread(slots, source, filter, stretchX, stretchY);
              ctx.toast(`Spread Studio applied across ${slots.length} panels`);
            }}
            className="w-full py-2 px-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-[9.5px] rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] [&_svg]:text-slate-950"
          />
        </div>
      </div>
    </div>
  );
};

/* ================= ASSET SORTER TAB ================= */

const ASPECT_SORTS: { id: SortMode; label: string }[] = [
  { id: "aspect-shape", label: "Shape Clusters (Square, Wide, Tall)" },
  { id: "aspect-wide-tall", label: "Wide to Tall (Descending Ratio)" },
  { id: "aspect-tall-wide", label: "Tall to Wide (Ascending Ratio)" },
];

const COLOR_SORTS: { id: SortMode; label: string }[] = [
  { id: "color-rainbow", label: "Rainbow Spectrum (Hue 0°–360°)" },
  { id: "color-family", label: "Grouped by Color Family" },
  { id: "color-warm-cool", label: "Warm to Cool Tones" },
  { id: "color-light-dark", label: "High-Key to Dark (Luminance)" },
  { id: "color-dark-light", label: "Dark to High-Key (Luminance)" },
];

const GROUP_MODES: { id: GroupMode; label: string }[] = [
  { id: "none", label: "None" },
  { id: "aspect-category", label: "By Aspect" },
  { id: "color-family", label: "By Color" },
];

export const SorterTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const pickSort = (id: SortMode) => {
    const next: SortMode = ctx.sortMode === id ? "none" : id;
    ctx.onSortMode(next);
    ctx.toast(next === "none" ? "Sort cleared" : `Sort mode: ${next.replace(/-/g, " ")}`);
  };

  return (
    <div className="space-y-2.5">
      <div className="bg-[#030d1a] p-2.5 rounded-2xl border border-amber-500/35 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
          <div className="flex items-center gap-1.5">
            <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
            <CustomizableLabel
              labelId="ad_panel_label_asset_sorter_title"
              defaultLabel="Asset Sorter Studio"
              className="text-[9.5px] font-bold text-amber-300 uppercase tracking-wider"
            />
          </div>
          <span className="text-[8px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
            {ctx.isAnalyzing && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {ctx.slices.length} Slices
          </span>
        </div>

        <div className="p-2 bg-[#020713] rounded-xl border border-amber-500/20 text-[8.5px] space-y-0.5">
          <div className="flex justify-between text-slate-400">
            <span>Current Sort:</span>
            <span className="font-mono text-amber-300 font-bold capitalize">{ctx.sortMode.replace(/-/g, " ")}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Current Grouping:</span>
            <span className="font-mono text-amber-300 font-bold capitalize">{ctx.groupMode.replace(/-/g, " ")}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[8.5px] text-slate-400 font-semibold block uppercase tracking-wider">Aspect Ratio Sort:</span>
          <div className="grid grid-cols-1 gap-1">
            {ASPECT_SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickSort(s.id)}
                className={cn(
                  "py-1 px-2 rounded-lg text-[8.5px] font-bold border transition-all cursor-pointer text-left flex items-center justify-between",
                  ctx.sortMode === s.id
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                    : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/60"
                )}
              >
                <span>{s.label}</span>
                {ctx.sortMode === s.id && <Check className="w-2.5 h-2.5" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold block uppercase tracking-wider">
            Color & Tone Spectrum:
          </span>
          <div className="grid grid-cols-1 gap-1">
            {COLOR_SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickSort(s.id)}
                className={cn(
                  "py-1 px-2 rounded-lg text-[8.5px] font-bold border transition-all cursor-pointer text-left flex items-center justify-between",
                  ctx.sortMode === s.id
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                    : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/60"
                )}
              >
                <span>{s.label}</span>
                {ctx.sortMode === s.id && <Check className="w-2.5 h-2.5" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold block uppercase tracking-wider">Cluster Grouping:</span>
          <div className="grid grid-cols-3 gap-1">
            {GROUP_MODES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  ctx.onGroupMode(g.id);
                  ctx.onGroupFilter(null);
                  ctx.toast(`Grouping: ${g.label}`);
                }}
                className={cn(
                  "py-1 px-1 rounded-md text-[8px] font-bold border transition-all cursor-pointer text-center",
                  ctx.groupMode === g.id
                    ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {ctx.groups.length > 0 && ctx.groupMode !== "none" && (
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Filter by Group:</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => ctx.onGroupFilter(null)}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors cursor-pointer",
                  !ctx.groupFilter ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-900 text-slate-400 border-slate-800"
                )}
              >
                All Groups
              </button>
              {ctx.groups.map((grp) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => ctx.onGroupFilter(ctx.groupFilter === grp.id ? null : grp.id)}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors cursor-pointer flex items-center gap-1",
                    ctx.groupFilter === grp.id
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  )}
                >
                  {grp.colorSwatch && (
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: grp.colorSwatch }} />
                  )}
                  <span>
                    {grp.title} ({grp.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold">Auto-Sort on Import:</span>
          <button
            type="button"
            onClick={() => {
              ctx.onToggleAutoSort(!ctx.autoSort);
              ctx.toast(`Auto-sort ${!ctx.autoSort ? "enabled" : "disabled"}`);
            }}
            className={cn(
              "px-2 py-0.5 rounded text-[8px] font-bold border cursor-pointer transition-colors",
              ctx.autoSort ? "bg-emerald-950 text-emerald-300 border-emerald-500/50" : "bg-slate-900 text-slate-500 border-slate-800"
            )}
          >
            {ctx.autoSort ? "Auto-Sort ON" : "Manual"}
          </button>
        </div>

        <div className="pt-1.5 border-t border-slate-800 space-y-1">
          <CustomizableButton
            buttonId="asset_sorter_apply_to_pool"
            defaultLabel="Apply Sorted Order to Storyboard Pool"
            defaultIcon={<Check />}
            onClick={() => {
              ctx.applySortedOrder();
              ctx.toast("Sorted order applied to storyboard pool");
            }}
            className="w-full py-2 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[9.5px] rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] [&_svg]:text-slate-950"
          />
          <button
            type="button"
            onClick={() => {
              ctx.resetSortedOrder();
              ctx.toast("Sort and cluster order reset");
            }}
            className="w-full py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-[8.5px] font-semibold cursor-pointer transition-colors"
          >
            Reset Order
          </button>
        </div>
      </div>
    </div>
  );
};
