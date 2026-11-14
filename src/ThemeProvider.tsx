import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { createThemeController, type ThemeController, type ThemeOptions, type ThemeSnapshot } from './theme';
export interface ThemeProviderProps extends ThemeOptions { children: ReactNode }
const Context = createContext<ThemeController | null>(null);
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
/** One provider per document. Theme CSS and shared components remain optional imports. */
export function ThemeProvider({ children, defaultTheme, defaultMode, storageKey, window, document }: ThemeProviderProps) {
  const controller = useMemo(() => createThemeController({ defaultTheme, defaultMode, storageKey, window, document }), [defaultTheme, defaultMode, storageKey, window, document]);
  useBrowserLayoutEffect(() => controller.start(), [controller]);
  return <Context.Provider value={controller}>{children}</Context.Provider>;
}
export interface ThemeContextValue extends ThemeSnapshot { setTheme: ThemeController['setTheme']; setMode: ThemeController['setMode'] }
export function useTheme(): ThemeContextValue {
  const controller = useContext(Context);
  if (!controller) throw new Error('useTheme requires a ThemeProvider');
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  return { ...snapshot, setTheme: controller.setTheme, setMode: controller.setMode };
}
