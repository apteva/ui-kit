// useColorMode — observes <html data-mode>, returns "dark" | "light".
//
// The dashboard sets data-mode at runtime; ui-kit components that
// need to branch on the active mode (e.g. CardHeader's vendor pill,
// which picks a brand color that's legible against the current
// surface) subscribe via this hook.
//
// useSyncExternalStore + MutationObserver gives us free re-renders
// when the attribute flips — no React state to keep in sync, no
// risk of drift.

import { useSyncExternalStore } from "react";

export type ColorMode = "dark" | "light";

export function useColorMode(): ColorMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function subscribe(notify: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): ColorMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.mode === "light" ? "light" : "dark";
}

function getServerSnapshot(): ColorMode {
  // SSR / initial render — terminal-dark is the dashboard default.
  return "dark";
}
