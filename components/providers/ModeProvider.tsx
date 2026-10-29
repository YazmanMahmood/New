"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Mode } from "@/data/products";

export type SiteMode = Mode | "none";

const ACCENTS: Record<SiteMode, string> = {
  none: "#D7263D",
  industrial: "#2BB673",
  security: "#2BB673",
  defense: "#D7263D",
};

type ModeContextValue = {
  mode: SiteMode;
  setMode: (mode: SiteMode, options?: { syncUrl?: boolean }) => void;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export function isMode(value: string | null): value is Mode {
  return value === "industrial" || value === "security" || value === "defense";
}

/**
 * Holds the global "mission mode". Changing it sets html[data-mode], which
 * swaps the CSS variables in globals.css and re-themes every page.
 * A short light sweep plays while the colours change.
 */
export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SiteMode>("none");
  const [wipe, setWipe] = useState<{ id: number; color: string } | null>(null);
  const reduceMotion = useReducedMotion();
  const modeRef = useRef<SiteMode>("none");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const setMode = useCallback<ModeContextValue["setMode"]>(
    (next, options) => {
      if (options?.syncUrl ?? true) {
        const url = new URL(window.location.href);
        if (next === "none") url.searchParams.delete("mode");
        else url.searchParams.set("mode", next);
        window.history.replaceState(window.history.state, "", url);
      }

      if (modeRef.current === next) return;
      modeRef.current = next;
      if (timer.current) clearTimeout(timer.current);

      if (reduceMotion) {
        setModeState(next);
        return;
      }

      // Start the sweep, then switch colours while it crosses the screen.
      setWipe({ id: Date.now(), color: ACCENTS[next] });
      timer.current = setTimeout(() => setModeState(next), 240);
    },
    [reduceMotion],
  );

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
      <AnimatePresence>
        {wipe && (
          <motion.div
            key={wipe.id}
            aria-hidden
            className="pointer-events-none fixed inset-y-0 z-[80] w-[60vw]"
            style={{
              background: `linear-gradient(90deg, transparent, ${wipe.color} 40%, ${wipe.color} 60%, transparent)`,
              opacity: 0.25,
            }}
            initial={{ left: "-60vw" }}
            animate={{ left: "100vw" }}
            transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
            onAnimationComplete={() => setWipe(null)}
          />
        )}
      </AnimatePresence>
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside ModeProvider");
  return ctx;
}
