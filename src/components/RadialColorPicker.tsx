// ─────────────────────────────────────────────────────────────
// Radial color picker — hue ring dial + lightness/sat sliders.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import { hslToHex, hexToHsl } from "../utils/spread";
import { cn } from "../utils/cn";

interface RadialColorPickerProps {
  value?: string;
  onChange: (hex: string) => void;
  defaultHue?: number;
}

const PRESETS = ["#10b981", "#22d3ee", "#38bdf8", "#a855f7", "#ec4899", "#f59e0b", "#ef4444", "#e2e8f0"];

export const RadialColorPicker: React.FC<RadialColorPickerProps> = ({ value, onChange, defaultHue = 160 }) => {
  const parsed = value ? hexToHsl(value) : null;
  const [hue, setHue] = useState(parsed ? parsed.h : defaultHue);
  const [sat, setSat] = useState(parsed ? parsed.s : 0.8);
  const [light, setLight] = useState(parsed ? parsed.l : 0.55);
  const wheelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // resync when external value changes
  useEffect(() => {
    if (!value) return;
    const hsl = hexToHsl(value);
    if (!Number.isNaN(hsl.h)) {
      setHue(hsl.h);
      setSat(hsl.s);
      setLight(hsl.l);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (h: number, s: number, l: number) => onChange(hslToHex(h, s, l));

  const pickFromEvent = (e: React.PointerEvent) => {
    const el = wheelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const h = (deg + 90 + 360) % 360;
    setHue(h);
    emit(h, sat, light);
  };

  const r = 52;
  const selRad = ((hue - 90) * Math.PI) / 180;
  const selX = 60 + Math.cos(selRad) * r - 7;
  const selY = 60 + Math.sin(selRad) * r - 7;
  const current = hslToHex(hue, sat, light);

  return (
    <div className="flex items-center gap-3">
      {/* Wheel */}
      <div
        ref={wheelRef}
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          pickFromEvent(e);
        }}
        onPointerMove={(e) => draggingRef.current && pickFromEvent(e)}
        onPointerUp={() => (draggingRef.current = false)}
        className="relative w-[120px] h-[120px] rounded-full shrink-0 cursor-crosshair touch-none select-none"
        style={{
          background:
            "conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 15px), #000 calc(100% - 14px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 15px), #000 calc(100% - 14px))",
        }}
      >
        {/* hue handle */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg pointer-events-none"
          style={{ left: selX, top: selY, background: hslToHex(hue, 1, 0.5) }}
        />
        {/* center preview */}
        <div
          className="absolute inset-[26px] rounded-full border border-white/20 shadow-inner pointer-events-none"
          style={{ background: current }}
        />
      </div>

      {/* Sliders + presets */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] text-slate-500 font-semibold uppercase tracking-wider">
            <span>Saturation</span>
            <span className="font-mono text-slate-300">{Math.round(sat * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sat}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setSat(v);
              emit(hue, v, light);
            }}
            className="w-full h-1"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] text-slate-500 font-semibold uppercase tracking-wider">
            <span>Lightness</span>
            <span className="font-mono text-slate-300">{Math.round(light * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.85}
            step={0.01}
            value={light}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setLight(v);
              emit(hue, sat, v);
            }}
            className="w-full h-1"
          />
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                "w-4 h-4 rounded-full border transition-transform hover:scale-110 cursor-pointer",
                value?.toLowerCase() === p ? "border-white ring-1 ring-white/60" : "border-white/15"
              )}
              style={{ background: p }}
              title={p}
            />
          ))}
          <span className="ml-auto font-mono text-[9px] text-slate-400">{value || current}</span>
        </div>
      </div>
    </div>
  );
};
