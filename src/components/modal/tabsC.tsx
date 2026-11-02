// ─────────────────────────────────────────────────────────────
// Inspector tabs C — Links & hover FX, Swap, Actions, Style Dial.
// ─────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import {
  Link2,
  Upload,
  Trash2,
  MousePointerClick,
  ArrowLeftRight,
  LayoutGrid,
  Grid3x3,
  Send,
  RotateCcw,
  RefreshCw,
  EyeOff,
  Check,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { CustomizableButton, CustomizableLabel } from "../Customizable";
import { RadialColorPicker } from "../RadialColorPicker";
import { allSlots, readImageFile, type ModalCtx } from "./ctx";

/* ================= LINK TAB ================= */

const HOVER_FX = [
  { id: "none", label: "None" },
  { id: "spin", label: "3D Spin" },
  { id: "change-image", label: "Swap Image" },
] as const;

export const LinkTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const link = ctx.panel.link;
  const slot = ctx.selectedSlot;
  const fileRef = useRef<HTMLInputElement>(null);
  const [testHover, setTestHover] = useState(false);
  const previewImg = ctx.panel.image || ctx.panel.spread?.source || "";

  return (
    <div className="space-y-2">
      <div className="bg-[#0e1628] p-2 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <CustomizableLabel
            labelId="ad_panel_label_link_title"
            defaultLabel={`Panel ${slot} Link & FX`}
            defaultIcon={<Link2 />}
            className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider [&_svg]:text-cyan-400"
          />
          {link.url && (
            <span className="text-[7.5px] font-mono text-cyan-400 font-bold bg-cyan-500/20 px-1 py-0.5 rounded">Active</span>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[8.5px] text-slate-300 font-semibold block">Destination URL</span>
          <input
            type="url"
            value={link.url}
            onChange={(e) => ctx.updateLink(slot, { url: e.target.value })}
            placeholder="https://example.com/landing"
            className="w-full bg-[#030712] border border-slate-800 rounded-lg px-2 py-1.5 text-[9.5px] font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[8.5px] text-slate-300 font-semibold block">Target Window</span>
          <div className="grid grid-cols-2 gap-1 text-[8.5px]">
            {(["_blank", "_self"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => ctx.updateLink(slot, { target: t })}
                className={cn(
                  "py-1 px-1 rounded-md border text-center font-bold transition-all cursor-pointer text-[8.5px]",
                  link.target === t ? "bg-cyan-500/20 text-cyan-300 border-cyan-500" : "bg-slate-900 border-slate-800 text-slate-400"
                )}
              >
                {t === "_blank" ? "New Window (_blank)" : "Same Tab (_self)"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] text-slate-300 font-semibold">Hover Animation Effect</span>
            <button
              type="button"
              onClick={() => setTestHover((p) => !p)}
              className={cn(
                "px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors cursor-pointer flex items-center gap-1",
                testHover ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-900 text-slate-400 border-slate-800"
              )}
            >
              <MousePointerClick className="w-2.5 h-2.5" /> Test
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {HOVER_FX.map((fx) => (
              <button
                key={fx.id}
                type="button"
                onClick={() => ctx.updateLink(slot, { hoverEffect: fx.id })}
                className={cn(
                  "py-1 px-1 rounded-md border text-center font-bold transition-all cursor-pointer text-[8px]",
                  link.hoverEffect === fx.id
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                )}
              >
                {fx.label}
              </button>
            ))}
          </div>
        </div>

        {link.hoverEffect === "change-image" && (
          <div className="p-1.5 rounded-lg bg-[#030712] border border-cyan-500/30 space-y-1">
            <span className="text-[8.5px] font-bold text-cyan-300 block">Secondary Image (Hover)</span>
            {link.hoverImage ? (
              <div className="flex items-center gap-2">
                <img src={link.hoverImage} alt="Hover" className="w-8 h-8 rounded-md object-cover border border-slate-700" />
                <button
                  type="button"
                  onClick={() => ctx.updateLink(slot, { hoverImage: undefined })}
                  className="text-[8px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Remove
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-[8.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-2.5 h-2.5 text-cyan-400" /> Upload Secondary Hover Image
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const url = await readImageFile(f);
                      ctx.updateLink(slot, { hoverImage: url });
                      ctx.toast("Secondary hover image set");
                    }
                    e.target.value = "";
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* live preview */}
        <div className="pt-1 border-t border-slate-800">
          <span className="text-[8px] text-slate-500 uppercase tracking-wider block mb-1">
            Live Preview {testHover ? "(hover simulated)" : "(toggle Test)"}
          </span>
          <div className="h-24 rounded-lg border border-slate-800 overflow-hidden relative bg-black/50 [perspective:800px]">
            <div
              className={cn(
                "absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]",
                testHover && link.hoverEffect === "spin" && "[transform:rotateY(360deg)]"
              )}
            >
              {previewImg && <img src={previewImg} alt="" className="w-full h-full object-cover" draggable={false} />}
              {link.hoverEffect === "change-image" && link.hoverImage && (
                <img
                  src={link.hoverImage}
                  alt=""
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                    testHover ? "opacity-100" : "opacity-0"
                  )}
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= SWAP TAB ================= */

export const SwapTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const thumbFor = (slot: number): string => {
    const pid = ctx.placement[slot - 1] ?? slot;
    const d = ctx.panels[pid];
    return d?.spread?.source || d?.image || "";
  };
  const currentThumb = thumbFor(ctx.selectedSlot);

  return (
    <div className="space-y-2">
      <div className="bg-[#0e1628] p-2 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <CustomizableLabel
            labelId="ad_panel_label_swap_title"
            defaultLabel={`Swap Panel ${ctx.selectedSlot} Content`}
            defaultIcon={<ArrowLeftRight />}
            className="text-[9px] font-bold text-orange-300 uppercase tracking-wider [&_svg]:text-orange-400"
          />
          <span className="text-[8px] text-slate-400">Panels glide to their new cells</span>
        </div>

        {/* current */}
        <div className="flex items-center gap-2 p-1.5 bg-[#030712] rounded-lg border border-orange-500/25">
          <div className="w-10 h-10 rounded-md overflow-hidden border border-orange-500/40 bg-slate-900 shrink-0">
            {currentThumb ? <img src={currentThumb} alt="" className="w-full h-full object-cover" /> : null}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-orange-300 block">Panel {ctx.selectedSlot} (you)</span>
            <span className="text-[7.5px] text-slate-500 block truncate">Pick a destination slot below — swap is animated on the stage</span>
          </div>
        </div>

        <div
          className="grid gap-1.5 pt-1"
          style={{ gridTemplateColumns: `repeat(${ctx.cols}, minmax(0,1fr))` }}
        >
          {allSlots(ctx.panelCount)
            .filter((s) => s !== ctx.selectedSlot)
            .map((s) => {
              const t = thumbFor(s);
              return (
                <button
                  key={s}
                  type="button"
                  title={`Swap Panel ${ctx.selectedSlot} with Panel ${s}`}
                  onClick={() => {
                    ctx.swapSlots(ctx.selectedSlot, s);
                    ctx.toast(`Swapped Panel ${ctx.selectedSlot} and Panel ${s}`);
                  }}
                  className="group relative aspect-square rounded-lg border border-slate-800 hover:border-orange-400 overflow-hidden cursor-pointer bg-black/50 transition-all hover:shadow-[0_0_16px_rgba(251,146,60,0.3)]"
                >
                  {t && <img src={t} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" draggable={false} />}
                  <span className="absolute bottom-1 left-1 px-1 rounded bg-black/75 font-mono text-[8px] font-bold text-orange-300 border border-orange-400/30">
                    #{s}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <ArrowLeftRight className="w-4 h-4 text-orange-300" />
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

/* ================= ACTIONS TAB ================= */

export const ActionsTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const slot = ctx.selectedSlot;
  const master = ctx.originalSpreadImage;

  return (
    <div className="space-y-2">
      {/* grid layout switcher — the smooth revert control */}
      <div className="bg-[#030d1a] p-2.5 rounded-2xl border border-emerald-500/35 space-y-2">
        <CustomizableLabel
          labelId="actions_label_grid_engine"
          defaultLabel="GRID LAYOUT ENGINE"
          className="text-[9.5px] font-bold text-emerald-300 uppercase tracking-wider block"
        />
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              ctx.setGridMode("3x3");
            }}
            className={cn(
              "p-2 rounded-xl border transition-all cursor-pointer text-left",
              ctx.gridMode === "3x3"
                ? "bg-emerald-500/15 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.25)]"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-600"
            )}
          >
            <Grid3x3 className={cn("w-4 h-4 mb-1", ctx.gridMode === "3x3" ? "text-emerald-300" : "text-slate-500")} />
            <span className={cn("block text-[10px] font-black", ctx.gridMode === "3x3" ? "text-emerald-200" : "text-slate-300")}>
              3×3 Classic
            </span>
            <span className="block text-[8px] text-slate-500 font-mono">9 slots</span>
          </button>
          <button
            type="button"
            onClick={() => {
              ctx.setGridMode("4x4");
            }}
            className={cn(
              "p-2 rounded-xl border transition-all cursor-pointer text-left",
              ctx.gridMode === "4x4"
                ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-600"
            )}
          >
            <LayoutGrid className={cn("w-4 h-4 mb-1", ctx.gridMode === "4x4" ? "text-cyan-300" : "text-slate-500")} />
            <span className={cn("block text-[10px] font-black", ctx.gridMode === "4x4" ? "text-cyan-200" : "text-slate-300")}>
              4×4 Expanded
            </span>
            <span className="block text-[8px] text-slate-500 font-mono">16 slots</span>
          </button>
        </div>
        <p className="text-[8px] text-slate-500 leading-snug">
          Switching is spring-animated — panels glide to their new cells. Reverting to 3×3 never discards panels
          10–16; they fold out and return intact.
        </p>
      </div>

      {/* panel actions */}
      <div className="bg-[#0e1628] p-2 rounded-xl border border-slate-800 space-y-1.5">
        <CustomizableButton
          buttonId="actions_split_master"
          defaultLabel="Split Master Across Grid"
          defaultIcon={<LayoutGrid />}
          disabled={!master}
          onClick={() => {
            ctx.applySpread(allSlots(ctx.panelCount), master, "none");
            ctx.toast(`Master split across ${ctx.panelCount} panels`);
          }}
          className="w-full py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/40 font-bold text-[9px] rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
        />
        <CustomizableButton
          buttonId="actions_upload_to_panel"
          defaultLabel={`Upload Image to Panel ${slot}`}
          defaultIcon={<Upload />}
          onClick={() => fileRef.current?.click()}
          className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[9px] rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
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
              ctx.assignImage(slot, url);
              ctx.toast(`Uploaded image to Panel ${slot}`);
            }
            e.target.value = "";
          }}
        />
        <CustomizableButton
          buttonId="actions_send_to_pool"
          defaultLabel="Send Panel Image to Storyboard Pool"
          defaultIcon={<Send />}
          disabled={!ctx.panel.image && !ctx.panel.spread}
          onClick={() => {
            const img = ctx.panel.image || ctx.panel.spread?.source || "";
            if (!img) return;
            ctx.sendToPool(`Panel ${slot} carve`, img);
            ctx.toast("Panel image added to storyboard pool");
          }}
          className="w-full py-1.5 px-2 bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-200 border border-indigo-500/40 font-bold text-[9px] rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
        />
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              ctx.resetPanel(slot);
              ctx.toast(`Panel ${slot} reset`);
            }}
            className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-[9px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Panel {slot}
          </button>
          <button
            type="button"
            onClick={() => {
              ctx.resetAllPanels();
              ctx.toast("All panels reset", "info");
            }}
            className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 font-bold text-[9px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset All
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            ctx.setDisableActions(!ctx.disableActions);
            ctx.toast(`Tile hover actions ${!ctx.disableActions ? "disabled" : "enabled"}`);
          }}
          className={cn(
            "w-full py-1.5 px-2 border font-bold text-[9px] rounded-lg flex items-center gap-2 cursor-pointer transition-colors",
            ctx.disableActions
              ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
              : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600"
          )}
        >
          {ctx.disableActions ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          <EyeOff className="w-3 h-3 opacity-60" />
          Disable on-stage tile actions
        </button>
      </div>
    </div>
  );
};

/* ================= STYLES TAB ================= */

const BG_SWATCHES = ["transparent", "#0a1120", "#052e2b", "#0c1a2e", "#1e1b4b", "#3b0764", "#451a03", "#500724"];

export const StylesTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const style = ctx.panel.style;
  const slot = ctx.selectedSlot;

  return (
    <div className="space-y-2">
      <div className="bg-[#030d1a] p-2.5 rounded-2xl border border-pink-500/35 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-pink-500/20">
          <CustomizableLabel
            labelId="styles_label_title"
            defaultLabel={`Panel ${slot} Style Dial`}
            className="text-[9.5px] font-bold text-pink-300 uppercase tracking-wider"
          />
          {/* mini live preview */}
          <div
            className="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors"
            style={{
              borderColor: style.borderColor || "#1e293b",
              background: style.backgroundColor === "transparent" ? "transparent" : style.backgroundColor || "#0a1120",
            }}
          >
            <span className="font-mono text-[8px] font-bold" style={{ color: style.textColor || "#38bdf8" }}>
              #{slot}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider block">Border Glow Color:</span>
          <RadialColorPicker
            value={style.borderColor || "#10b981"}
            onChange={(hex) => ctx.updateStyle(slot, { borderColor: hex })}
          />
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider block">Text / Chip Color:</span>
          <RadialColorPicker
            value={style.textColor || "#38bdf8"}
            onChange={(hex) => ctx.updateStyle(slot, { textColor: hex })}
            defaultHue={205}
          />
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold uppercase tracking-wider block">Panel Background:</span>
          <div className="flex gap-1.5 flex-wrap">
            {BG_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => ctx.updateStyle(slot, { backgroundColor: c })}
                className={cn(
                  "w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 cursor-pointer",
                  (style.backgroundColor || "transparent") === c ? "border-white" : "border-slate-700"
                )}
                style={{
                  background: c === "transparent" ? "repeating-conic-gradient(#1e293b 0% 25%, #0a1120 0% 50%) 0 0/8px 8px" : c,
                }}
              />
            ))}
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800">
          <CustomizableButton
            buttonId="styles_apply_all"
            defaultLabel={`Apply This Style to All ${ctx.panelCount} Panels`}
            defaultIcon={<Check />}
            onClick={() => {
              ctx.applyStyleToAll({ ...style });
              ctx.toast("Style dial applied to all panels");
            }}
            className="w-full py-2 px-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-[9.5px] rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
          />
        </div>
      </div>
    </div>
  );
};
