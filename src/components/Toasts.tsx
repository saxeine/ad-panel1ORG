import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "../utils/cn";

export interface ToastMsg {
  id: number;
  text: string;
  kind: "success" | "info" | "error";
}

const KIND_STYLES: Record<ToastMsg["kind"], { icon: React.ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, ring: "border-emerald-500/40" },
  info: { icon: <Info className="w-3.5 h-3.5 text-cyan-400" />, ring: "border-cyan-500/40" },
  error: { icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />, ring: "border-rose-500/40" },
};

export const Toasts: React.FC<{ items: ToastMsg[] }> = ({ items }) => (
  <div className="fixed bottom-5 right-5 z-[200] flex flex-col items-end gap-2 pointer-events-none">
    <AnimatePresence>
      {items.map((t) => (
        <motion.div
          key={t.id}
          layout
          initial={{ opacity: 0, x: 48, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 32, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
          className={cn(
            "glass border rounded-xl px-3 py-2 flex items-center gap-2 shadow-2xl max-w-xs",
            KIND_STYLES[t.kind].ring
          )}
        >
          {KIND_STYLES[t.kind].icon}
          <span className="text-[11px] font-semibold text-slate-100 leading-snug">{t.text}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
