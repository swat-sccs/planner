"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function SwatSwimSurprisePopup() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="A special surprise"
          className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-2xl border border-orange-200 bg-white/95 p-3 pr-4 shadow-[0_14px_45px_rgba(49,66,93,0.24)] backdrop-blur dark:border-orange-400/30 dark:bg-slate-900/95"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 330, damping: 24 }}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-xl shadow-md">
            ✨
          </span>
          <Link
            href="/swatswim-surprise"
            className="group rounded-lg py-1 text-sm font-bold text-slate-700 outline-none transition hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-slate-100 dark:hover:text-orange-300"
          >
            <span className="block">Special SwatSwim surprise</span>
            <span className="block text-xs font-medium text-slate-500 group-hover:text-orange-500 dark:text-slate-400">
              Open if you dare →
            </span>
          </Link>
          <button
            type="button"
            aria-label="Dismiss surprise"
            onClick={() => setVisible(false)}
            className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            ×
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
