/** Framework-independent appearance contract shared by hosted and standalone UIs. */
export type ThemeName = 'terminal' | 'clean';
export type ThemeMode = 'auto' | 'dark' | 'light';
export type ResolvedMode = 'dark' | 'light';
export interface Appearance { theme: ThemeName; mode: ThemeMode }
export interface ThemeSnapshot extends Appearance { resolvedMode: ResolvedMode }
export interface ThemeOptions {
  defaultTheme?: ThemeName;
  defaultMode?: ThemeMode;
  /** Use an application-specific key when preferences should be independent. */
  storageKey?: string;
  window?: Window;
  document?: Document;
}
export const APPEARANCE_STORAGE_KEY = 'apteva.appearance';
const defaults = (options: ThemeOptions): Appearance => ({ theme: options.defaultTheme ?? 'terminal', mode: options.defaultMode ?? 'auto' });
export function parseAppearance(value: unknown, fallback: Appearance): Appearance {
  const input = value && typeof value === 'object' ? value as Partial<Appearance> : {};
  return {
    theme: input.theme === 'terminal' || input.theme === 'clean' ? input.theme : fallback.theme,
    mode: input.mode === 'auto' || input.mode === 'dark' || input.mode === 'light' ? input.mode : fallback.mode,
  };
}
const targetWindow = (options: ThemeOptions) => options.window ?? (typeof window === 'undefined' ? undefined : window);
const targetDocument = (options: ThemeOptions) => options.document ?? options.window?.document ?? (typeof document === 'undefined' ? undefined : document);
export function resolveThemeMode(mode: ThemeMode, target?: Window): ResolvedMode {
  return mode !== 'auto' ? mode : !target?.matchMedia ? 'dark' : target.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function read(options: ThemeOptions): Appearance {
  const fallback = defaults(options);
  try { const text = targetWindow(options)?.localStorage.getItem(options.storageKey ?? APPEARANCE_STORAGE_KEY); return parseAppearance(text ? JSON.parse(text) : undefined, fallback); }
  catch { return fallback; }
}
function apply(snapshot: ThemeSnapshot, options: ThemeOptions) {
  const root = targetDocument(options)?.documentElement;
  if (root) { root.dataset.theme = snapshot.theme; root.dataset.mode = snapshot.resolvedMode; root.style.colorScheme = snapshot.resolvedMode; }
}
/** Call from a small blocking head script, before rendering, to avoid a theme flash. */
export function initializeTheme(options: ThemeOptions = {}): ThemeSnapshot {
  const appearance = read(options), snapshot = { ...appearance, resolvedMode: resolveThemeMode(appearance.mode, targetWindow(options)) };
  apply(snapshot, options); return snapshot;
}
export interface ThemeController {
  getSnapshot(): ThemeSnapshot;
  getServerSnapshot(): ThemeSnapshot;
  subscribe(listener: () => void): () => void;
  start(): () => void;
  setTheme(theme: ThemeName): void;
  setMode(mode: ThemeMode): void;
}
export function createThemeController(options: ThemeOptions = {}): ThemeController {
  const target = targetWindow(options), key = options.storageKey ?? APPEARANCE_STORAGE_KEY;
  let appearance = read(options);
  let snapshot: ThemeSnapshot = { ...appearance, resolvedMode: resolveThemeMode(appearance.mode, target) };
  // SSR and hydration must agree without consulting client-only preferences.
  const serverAppearance = defaults(options);
  const serverSnapshot: ThemeSnapshot = { ...serverAppearance, resolvedMode: resolveThemeMode(serverAppearance.mode) };
  const listeners = new Set<() => void>();
  let users = 0;
  const update = (next: Appearance, persist = false) => {
    appearance = next;
    const resolvedMode = resolveThemeMode(next.mode, target);
    const changed = snapshot.theme !== next.theme || snapshot.mode !== next.mode || snapshot.resolvedMode !== resolvedMode;
    if (changed) snapshot = { ...next, resolvedMode };
    apply(snapshot, options);
    if (persist) try { target?.localStorage.setItem(key, JSON.stringify(next)); } catch { /* Private browsing/storage denial must not disable appearance controls. */ }
    if (changed) for (const listener of listeners) listener();
  };
  const storage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return;
    // sessionStorage events can use the same key; they are not preferences.
    try { if (event.storageArea && event.storageArea !== target?.localStorage) return; } catch { return; }
    let next: unknown; try { next = event.newValue ? JSON.parse(event.newValue) : undefined; } catch {}
    update(parseAppearance(next, defaults(options)));
  };
  const media = target?.matchMedia?.('(prefers-color-scheme: dark)');
  const system = () => { if (appearance.mode === 'auto') update(appearance); };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    start() {
      if (users++ === 0) { update(read(options)); target?.addEventListener('storage', storage); media?.addEventListener('change', system); }
      let stopped = false;
      return () => { if (!stopped && --users === 0) { target?.removeEventListener('storage', storage); media?.removeEventListener('change', system); } stopped = true; };
    },
    setTheme(theme) { if (theme === 'terminal' || theme === 'clean') update({ ...appearance, theme }, true); },
    setMode(mode) { if (mode === 'auto' || mode === 'dark' || mode === 'light') update({ ...appearance, mode }, true); },
  };
}
