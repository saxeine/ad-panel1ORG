// ─────────────────────────────────────────────────────────────
// Inspector tabs B — 2.5D Parallax, Storyboard Media, Rotation.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, useMemo } from "react";
import { Box, Play, Pause, Check, Trash2, RotateCw, Clock, Plus, Upload, Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";
import { CustomizableButton, CustomizableLabel } from "../Customizable";
import { sortSlices, groupIdOf } from "../../utils/sorter";
import { readImageFile, type ModalCtx } from "./ctx";

/* ================= 2.5D PARALLAX TAB ================= */

export const ParallaxTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [depth, setDepth] = useState(25);
  const [orbit, setOrbit] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [fgScale, setFgScale] = useState(1.08);
  const [mgScale, setMgScale] = useState(1.04);
  const [wireframe, setWireframe] = useState(false);

  // hydrate from the panel's saved config when the slot changes
  useEffect(() => {
    const p = ctx.panel.parallax;
    if (p) {
      setDepth(p.depth);
      setFgScale(p.fgScale);
      setMgScale(p.mgScale);
      setOrbit(p.orbit);
      setSpeed(p.speed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.selectedSlot]);

  useEffect(() => {
    if (!orbit) return;
    let angle = 0;
    let raf = 0;
    const tick = () => {
      angle += 0.03 * speed;
      setTiltX(Math.sin(angle) * depth);
      setTiltY(Math.cos(angle * 0.7) * depth * 0.8);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [orbit, speed, depth]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (orbit) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltX(x * depth * 2);
    setTiltY(y * depth * 2);
  };

  const img = ctx.panel.image || ctx.panel.spread?.source || ctx.originalSpreadImage;

  return (
    <div className="space-y-2.5">
      <div className="bg-[#030d1a] p-2.5 rounded-2xl border border-purple-500/35 space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-purple-500/20">
          <div className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-purple-400" />
            <CustomizableLabel
              labelId="ad_panel_label_parallax_title"
              defaultLabel="2.5D Depth & Parallax"
              className="text-[9.5px] font-bold text-purple-300 uppercase tracking-wider"
            />
          </div>
          <span className="text-[8px] font-mono text-purple-400 bg-purple-950/80 border border-purple-500/30 px-1.5 py-0.5 rounded">
            Tilt: {Math.round(tiltX)}px, {Math.round(tiltY)}px
          </span>
        </div>

        {/* viewport */}
        <div
          onMouseMove={handleMouseMove}
          title={orbit ? "Auto orbit active — switch to mouse tilt" : "Move mouse to tilt depth layers"}
          className="w-full h-40 bg-[#020713] rounded-xl border border-purple-500/30 relative overflow-hidden flex items-center justify-center select-none cursor-crosshair [perspective:1000px]"
        >
          {img ? (
            <>
              <div
                className="absolute inset-0 transition-transform duration-75 ease-out brightness-[0.6] blur-[2px]"
                style={{ transform: `translate3d(${-tiltX * 0.3}px, ${-tiltY * 0.3}px, -40px) scale(1.18)` }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" draggable={false} />
              </div>
              <div
                className="absolute inset-0 transition-transform duration-75 ease-out"
                style={{ transform: `translate3d(${tiltX * 0.45}px, ${tiltY * 0.45}px, 0px) scale(${mgScale})` }}
              >
                <img src={img} alt="" className="w-full h-full object-cover contrast-105" draggable={false} />
              </div>
              <div
                className="absolute inset-0 transition-transform duration-75 ease-out drop-shadow-2xl"
                style={{ transform: `translate3d(${tiltX * 0.85}px, ${tiltY * 0.85}px, 40px) scale(${fgScale})` }}
              >
                <img src={img} alt="" className="w-full h-full object-contain saturate-125" draggable={false} />
              </div>
            </>
          ) : (
            <span className="text-[9px] text-slate-500">No image on this panel yet</span>
          )}

          {wireframe && (
            <div className="absolute inset-2 border-2 border-dashed border-purple-400/60 pointer-events-none rounded-lg" />
          )}
          <div className="absolute bottom-1 right-1 text-[7.5px] font-mono text-purple-300 bg-black/70 px-1 py-0.5 rounded border border-purple-500/20">
            {orbit ? "Orbiting" : "Mouse Tilt"}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold">Camera Mode:</span>
          <button
            type="button"
            onClick={() => setOrbit((p) => !p)}
            className={cn(
              "px-2 py-0.5 rounded text-[8px] font-bold border transition-colors cursor-pointer flex items-center gap-1",
              orbit ? "bg-purple-600 text-white border-purple-400 shadow-sm" : "bg-slate-900 text-purple-300 border-slate-800"
            )}
          >
            {orbit ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            <span>{orbit ? "Orbit ON" : "Mouse Tilt"}</span>
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[8px] text-slate-400">
            <span>Depth Movement:</span>
            <span className="font-mono text-purple-300">{depth}px</span>
          </div>
          <input type="range" min={5} max={60} value={depth} onChange={(e) => setDepth(parseInt(e.target.value))} className="w-full range-purple" />
        </div>

        {orbit && (
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] text-slate-400">
              <span>Orbit Speed:</span>
              <span className="font-mono text-purple-300">{speed.toFixed(1)}x</span>
            </div>
            <input type="range" min={0.2} max={3} step={0.1} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full range-purple" />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-[8px] text-slate-400">
            <span>Foreground Scale:</span>
            <span className="font-mono text-purple-300">{fgScale.toFixed(2)}x</span>
          </div>
          <input type="range" min={1} max={1.3} step={0.01} value={fgScale} onChange={(e) => setFgScale(parseFloat(e.target.value))} className="w-full range-purple" />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[8px] text-slate-400">
            <span>Midground Scale:</span>
            <span className="font-mono text-purple-300">{mgScale.toFixed(2)}x</span>
          </div>
          <input type="range" min={1} max={1.2} step={0.01} value={mgScale} onChange={(e) => setMgScale(parseFloat(e.target.value))} className="w-full range-purple" />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
          <span className="text-[8.5px] text-slate-400 font-semibold">Wireframe Bounds:</span>
          <button
            type="button"
            onClick={() => setWireframe((p) => !p)}
            className={cn(
              "px-2 py-0.5 rounded text-[8px] font-bold border transition-colors cursor-pointer",
              wireframe ? "bg-purple-950 text-purple-300 border-purple-500/50" : "bg-slate-900 text-slate-500 border-slate-800"
            )}
          >
            {wireframe ? "Visible" : "Hidden"}
          </button>
        </div>

        <div className="pt-1.5 border-t border-slate-800 space-y-1">
          <CustomizableButton
            buttonId="parallax_apply_to_panel"
            defaultLabel={`Apply 2.5D Parallax to Panel ${ctx.selectedSlot}`}
            defaultIcon={<Check />}
            onClick={() => {
              ctx.updatePanel(ctx.selectedSlot, { parallax: { depth, fgScale, mgScale, orbit, speed } });
              ctx.toast(`2.5D parallax applied to Panel ${ctx.selectedSlot}`);
            }}
            className="w-full py-2 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[9.5px] rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
          />
          {ctx.panel.parallax && (
            <button
              type="button"
              onClick={() => {
                ctx.updatePanel(ctx.selectedSlot, { parallax: null });
                ctx.toast("Parallax removed from panel");
              }}
              className="w-full py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-lg text-[8.5px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-2.5 h-2.5" /> Remove Parallax
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= MEDIA TAB ================= */

export const MediaTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const display = useMemo(() => {
    let list = sortSlices(ctx.slices, ctx.metas, ctx.sortMode);
    if (ctx.groupMode !== "none" && ctx.groupFilter) {
      list = list.filter((s) => groupIdOf(ctx.metas, s.url, ctx.groupMode) === ctx.groupFilter);
    }
    return list;
  }, [ctx.slices, ctx.metas, ctx.sortMode, ctx.groupMode, ctx.groupFilter]);

  return (
    <div className="space-y-2">
      <div className="bg-[#0e1628] p-2 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <CustomizableLabel
            labelId="ad_panel_label_media_title"
            defaultLabel={`Storyboard Slices (${display.length})`}
            defaultIcon={<Sparkles />}
            className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider [&_svg]:text-indigo-400"
          />
          <CustomizableLabel
            labelId="ad_panel_label_media_subtitle"
            defaultLabel={`Click to set Panel ${ctx.selectedSlot}`}
            className="text-[8px] text-slate-400"
          />
        </div>

        {display.length === 0 ? (
          <div className="p-3 text-center border border-dashed border-slate-800 rounded-lg space-y-1">
            <Sparkles className="w-3.5 h-3.5 text-slate-600 mx-auto" />
            <p className="text-[9px] text-slate-400 font-medium">No Storyboard Slices Found</p>
            <p className="text-[8px] text-slate-500">Carve frames or crop slices in the workspace to populate this picker.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-1">
            {display.map((slice, i) => (
              <button
                key={`${slice.url}-${i}`}
                type="button"
                title={`Assign "${slice.name}" to Panel ${ctx.selectedSlot}`}
                onClick={() => {
                  ctx.assignImage(ctx.selectedSlot, slice.url);
                  ctx.toast(`Set "${slice.name}" to Panel ${ctx.selectedSlot}`);
                }}
                className="relative aspect-video rounded-lg border border-slate-800 hover:border-indigo-400 overflow-hidden group/thumb transition-all cursor-pointer bg-black/60 text-left p-0"
              >
                <img src={slice.url} alt={slice.name} loading="lazy" className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-end p-1 pointer-events-none">
                  <span className="text-[7.5px] font-bold text-white truncate">{slice.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= ROTATION TAB ================= */

export const RotationTab: React.FC<{ ctx: ModalCtx }> = ({ ctx }) => {
  const frames = ctx.panel.rotation;
  const interval = ctx.panel.rotationInterval;
  const rotating = ctx.panel.rotating;
  const fileRef = useRef<HTMLInputElement>(null);
  const slot = ctx.selectedSlot;

  return (
    <div className="space-y-2">
      <div className="bg-[#0e1628] p-2 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <CustomizableLabel
            labelId="ad_panel_label_rotation_title"
            defaultLabel={`Panel ${slot} Rotation`}
            defaultIcon={<RotateCw />}
            className="text-[9px] font-bold text-purple-300 uppercase tracking-wider [&_svg]:text-purple-400"
          />
          <button
            type="button"
            onClick={() => {
              ctx.updatePanel(slot, { rotating: !rotating });
              ctx.toast(`Rotation ${!rotating ? "activated" : "paused"} on Panel ${slot}`);
            }}
            className={cn(
              "px-1.5 py-0.5 rounded-md text-[8.5px] font-bold transition-all cursor-pointer flex items-center gap-1",
              rotating ? "bg-purple-600 text-white shadow" : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            {rotating ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            {rotating ? "Rotating: ON" : "Rotating: OFF"}
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[8.5px]">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-purple-400" /> Interval:
            </span>
            <span className="font-mono font-bold text-purple-300">{interval}s</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={interval}
            onChange={(e) => ctx.updatePanel(slot, { rotationInterval: parseInt(e.target.value) || 3 })}
            className="w-full range-purple"
          />
        </div>

        <div className="pt-1.5 border-t border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-bold text-slate-300">Playlist ({frames.length} frames)</span>
            {frames.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  ctx.updatePanel(slot, { rotation: [], rotating: false });
                  ctx.toast("Cleared rotation playlist");
                }}
                className="text-[8px] text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-0.5"
              >
                <Trash2 className="w-2.5 h-2.5" /> Clear
              </button>
            )}
          </div>

          {frames.length === 0 ? (
            <div className="p-2.5 text-center border border-dashed border-slate-800 rounded-lg space-y-0.5">
              <RotateCw className="w-3.5 h-3.5 text-slate-600 mx-auto" />
              <p className="text-[8.5px] text-slate-400">No images in rotation series.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto pr-0.5">
              {frames.map((img, idx) => (
                <div key={`${idx}`} className="relative aspect-square rounded-lg border border-slate-800 overflow-hidden group/frame bg-black/60">
                  <img src={img} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute top-0.5 left-0.5 px-1 rounded text-[7px] font-mono font-bold bg-black/80 text-purple-300">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    title="Remove frame"
                    onClick={() => ctx.updatePanel(slot, { rotation: frames.filter((_, i) => i !== idx) })}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 opacity-0 group-hover/frame:opacity-100 transition-opacity cursor-pointer border-0"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 mt-1">
            <CustomizableButton
              buttonId="ad_panel_btn_add_active_to_rotation"
              defaultLabel="Add Current"
              defaultIcon={<Plus />}
              disabled={!ctx.panel.image}
              onClick={() => {
                if (!ctx.panel.image) return;
                ctx.updatePanel(slot, { rotation: [...frames, ctx.panel.image] });
                ctx.toast(`Added frame to Panel ${slot} rotation`);
              }}
              className="py-1 px-1 bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 font-bold text-[8.5px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
            />
            <CustomizableButton
              buttonId="ad_panel_btn_upload_rotation_frame"
              defaultLabel="Upload Frame"
              defaultIcon={<Upload />}
              onClick={() => fileRef.current?.click()}
              className="py-1 px-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[8.5px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors [&_svg]:text-purple-400"
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
                  ctx.updatePanel(slot, { rotation: [...frames, url] });
                  ctx.toast(`Uploaded frame to Panel ${slot} rotation`);
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
