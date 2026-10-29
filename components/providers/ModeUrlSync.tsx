"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isMode, useMode } from "./ModeProvider";

/** Reads ?mode= from the URL so a mode can be linked and shared. */
export function ModeUrlSync() {
  const params = useSearchParams();
  const { setMode } = useMode();
  const value = params.get("mode");

  useEffect(() => {
    if (isMode(value)) setMode(value, { syncUrl: false });
  }, [value, setMode]);

  return null;
}
