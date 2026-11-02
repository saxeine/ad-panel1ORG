// ─────────────────────────────────────────────────────────────
// Lightweight customizable button / label system.
// Alt+Click any customizable control to re-skin it (label, icon,
// accent). Persisted to localStorage; a single <CustomizationHost/>
// mounted in App renders the floating editor.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Grid3x3,
  Sparkles,
  LayoutGrid,
  Upload,
  RotateCw,
  Link2,
  Scissors,
  ArrowLeftRight,
  Box,
  ArrowDownUp,
  Palette,
  Check,
  X,
  Play,
  Pause,
  Star,
  Zap,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  MousePointerClick,
  Layers,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";

const STORE_KEY = "scui-custom-v1";

export const ICON_MAP: Record<string, LucideIcon> = {
  grid: Grid3x3,
  sparkles: Sparkles,
  layout: LayoutGrid,
  upload: Upload,
  rotate: RotateCw,
  link: Link2,
  scissors: Scissors,
  swap: ArrowLeftRight,
  box: Box,
  sort: ArrowDownUp,
  palette: Palette,
  check: Check,
  x: X,
  play: Play,
  pause: Pause,
  star: Star,
  zap: Zap,
  plus: Plus,
  trash: Trash2,
  external: ExternalLink,
  clock: Clock,
  cursor: MousePointerClick,
  layers: Layers,
  bookmark: Bookmark,
};

export const ACCENTS: Record<string, string> = {
  none: "",
  emerald: "text-emerald-400",
  cyan: "text-cyan-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
};

interface CustomRecord {
  label?: string;
  icon?: string;
  accent?: string;
}

function readStore(): Record<string, CustomRecord> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(next: Record<string, CustomRecord>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("scui-cust"));
}

function useCustom(id: string): CustomRecord {
  const [rec, setRec] = useState<CustomRecord>(() => readStore()[id] || {});
  useEffect(() => {
    const sync = () => setRec(readStore()[id] || {});
    window.addEventListener("scui-cust", sync);
    return () => window.removeEventListener("scui-cust", sync);
  }, [id]);
  return rec;
}

interface EditorRequest {
  id: string;
  kind: "button" | "label";
  defaultLabel: string;
  x: number;
  y: number;
}

function openEditor(req: EditorRequest) {
  window.dispatchEvent(new CustomEvent("scui-open-editor", { detail: req }));
}

/* ---------------- Button ---------------- */

interface CustomizableButtonProps {
  buttonId: string;
  defaultLabel: string;
  defaultIcon?: React.ReactNode;
  forceZeroText?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export const CustomizableButton: React.FC<CustomizableButtonProps> = ({
  buttonId,
  defaultLabel,
  defaultIcon,
  forceZeroText = false,
  className,
  title,
  disabled,
  onClick,
  children,
}) => {
  const rec = useCustom(buttonId);
  const CustomIcon = rec.icon ? ICON_MAP[rec.icon] : null;
  const accentCls = rec.accent ? ACCENTS[rec.accent] : "";
  const label = rec.label ?? defaultLabel;

  return (
    <button
      type="button"
      disabled={disabled}
      title={title ? `${title} (Alt+Click to customize)` : label}
      onClick={(e) => {
        if (e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          openEditor({ id: buttonId, kind: "button", defaultLabel, x: e.clientX, y: e.clientY });
          return;
        }
        onClick?.(e);
      }}
      className={cn("disabled:opacity-40 disabled:pointer-events-none", className)}
    >
      {CustomIcon ? (
        <CustomIcon className={cn("w-3.5 h-3.5 shrink-0", accentCls)} />
      ) : defaultIcon ? (
        <span className={cn("inline-flex shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5", accentCls)}>{defaultIcon}</span>
      ) : null}
      {!forceZeroText && <span className="truncate">{label}</span>}
      {children}
    </button>
  );
};

/* ---------------- Label ---------------- */

interface CustomizableLabelProps {
  labelId: string;
  defaultLabel: string;
  defaultIcon?: React.ReactNode;
  className?: string;
}

export const CustomizableLabel: React.FC<CustomizableLabelProps> = ({
  labelId,
  defaultLabel,
  defaultIcon,
  className,
}) => {
  const rec = useCustom(labelId);
  const label = rec.label ?? defaultLabel;
  const accentCls = rec.accent ? ACCENTS[rec.accent] : "";
  return (
    <span
      title={`${label} (Alt+Click to customize)`}
      onClick={(e) => {
        if (e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          openEditor({ id: labelId, kind: "label", defaultLabel, x: e.clientX, y: e.clientY });
        }
      }}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {defaultIcon ? <span className={cn("inline-flex [&>svg]:w-3 [&>svg]:h-3", accentCls)}>{defaultIcon}</span> : null}
      <span className="truncate">{label}</span>
    </span>
  );
};

/* ---------------- Editor host ---------------- */

export const CustomizationHost: React.FC = () => {
  const [req, setReq] = useState<EditorRequest | null>(null);
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState<string | undefined>();
  const [accent, setAccent] = useState<string>("none");

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<EditorRequest>).detail;
      const rec = readStore()[d.id] || {};
      setLabel(rec.label ?? d.defaultLabel);
      setIcon(rec.icon);
      setAccent(rec.accent || "none");
      setReq(d);
    };
    window.addEventListener("scui-open-editor", handler);
    return () => window.removeEventListener("scui-open-editor", handler);
  }, []);

  useEffect(() => {
    if (!req) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setReq(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [req]);

  const save = (patch: Partial<CustomRecord>) => {
    if (!req) return;
    const store = readStore();
    store[req.id] = { ...store[req.id], ...patch };
    writeStore(store);
  };

  const x = req ? Math.min(Math.max(8, req.x - 110), window.innerWidth - 250) : 0;
  const y = req ? Math.min(Math.max(8, req.y + 12), window.innerHeight - 300) : 0;

  return (
    <AnimatePresence>
      {req && (
        <>
          <div className="fixed inset-0 z-[120]" onClick={() => setReq(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="fixed z-[130] w-60 glass border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden"
            style={{ left: x, top: y }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Customize {req.kind}
              </span>
              <button
                onClick={() => setReq(null)}
                className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Label
                </span>
                <input
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    save({ label: e.target.value });
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              {req.kind === "button" && (
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                    Icon
                  </span>
                  <div className="grid grid-cols-8 gap-1">
                    {Object.entries(ICON_MAP).map(([name, Ico]) => (
                      <button
                        key={name}
                        title={name}
                        onClick={() => {
                          const next = icon === name ? undefined : name;
                          setIcon(next);
                          save({ icon: next });
                        }}
                        className={cn(
                          "aspect-square rounded-md border flex items-center justify-center transition-colors",
                          icon === name
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-200"
                        )}
                      >
                        <Ico className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Accent
                </span>
                <div className="flex gap-1">
                  {Object.entries(ACCENTS).map(([name, cls]) => (
                    <button
                      key={name}
                      title={name}
                      onClick={() => {
                        setAccent(name);
                        save({ accent: name === "none" ? undefined : name });
                      }}
                      className={cn(
                        "w-6 h-6 rounded-md border flex items-center justify-center transition-all",
                        accent === name ? "border-emerald-400 bg-emerald-500/15" : "border-slate-800 bg-slate-900"
                      )}
                    >
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          name === "none" ? "bg-slate-600" : cls.replace("text-", "bg-")
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => {
                    const store = readStore();
                    delete store[req.id];
                    writeStore(store);
                    setLabel(req.defaultLabel);
                    setIcon(undefined);
                    setAccent("none");
                  }}
                  className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-400"
                >
                  Reset
                </button>
                <button
                  onClick={() => setReq(null)}
                  className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[10px] font-bold text-slate-950"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
