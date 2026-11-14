# @apteva/ui-kit

Shared Apteva React components, four Terminal/Clean palettes, and appearance management for dashboard panels and independent pages. React 19 is a peer dependency and must resolve to the host's React runtime.

## Standalone React page

```tsx
import { ThemeProvider, useTheme, Card, CardHeader } from '@apteva/ui-kit';
import '@apteva/ui-kit/theme.css';
import '@apteva/ui-kit/styles.css';

export const appearanceOptions = {
  defaultTheme: 'terminal',
  defaultMode: 'auto',
  storageKey: 'my-app.appearance',
} as const;

function Appearance() {
  const { theme, mode, resolvedMode, setTheme, setMode } = useTheme();
  return <>
    <button onClick={() => setTheme(theme === 'clean' ? 'terminal' : 'clean')}>
      Theme: {theme}
    </button>
    <button onClick={() => setMode(mode === 'auto' ? 'dark' : 'auto')}>
      Mode: {mode} ({resolvedMode})
    </button>
  </>;
}

export function App() {
  return <ThemeProvider {...appearanceOptions}>
    <main className="apteva-ui apteva-page">
      <Appearance />
      <Card><CardHeader title="Shared appearance" /></Card>
    </main>
  </ThemeProvider>;
}
```

`ThemeProvider` controls `<html data-theme="terminal|clean" data-mode="dark|light">` and its `color-scheme`. `mode: 'auto'` follows OS changes. `useTheme()` exposes `theme`, `mode`, `resolvedMode`, `setTheme()` and `setMode()`. Defaults are Terminal/System with the `apteva.appearance` local-storage key. Set an application-specific key to keep independent preferences. Malformed or blocked storage falls back safely; changes synchronize across tabs on the same origin. Different domains need a host/account preference mechanism to share a selection.

Use one provider per document. Keep the existing dashboard provider when rendering dashboard panels; `useColorMode()` remains available and observes the dashboard's `data-mode` without requiring this provider. The new provider is opt-in and performs no work merely by importing the package.

### CSS boundary and page baseline

`theme.css` is compiled, framework-independent CSS containing typography, radii, shadows, surfaces, borders, accents, statuses, and all four palettes. Its custom properties live on the document root. It contains no Tailwind directives, resets, font downloads, or body rules.

`styles.css` supplies compiled utilities for UI Kit's components. Every utility and reset is scoped under `.apteva-ui`; unrelated host elements retain their styles. Put components **inside** that wrapper and also wrap any portal roots. Place app-specific utility classes on child elements, not the boundary itself. Resets have zero specificity, and host rules can override the baseline. Dark variants follow resolved `data-mode`, including when the OS preference differs.

The optional `.apteva-page` class adds a themed background and viewport minimum height. Combined with `.apteva-ui`, it provides the dashboard's 15px typography, text color, controls, and link baseline without changing `html`/`body`, document margins, or scrolling. Hosts decide their page margins and layout. Each app supplies its additional widget CSS; `styles.css` only includes utilities used by UI Kit components.

Fonts are supplied by the host. To match the dashboard exactly, self-host **JetBrains Mono** and **Inter** at weights 400, 500, 600, and 700, declare them with `@font-face`, and preload the active face if needed. Terminal uses JetBrains Mono; Clean uses Inter. System fallbacks work when those faces are unavailable. The package never starts a font download.

### Initialize before first paint

Bundle a small React-independent initializer using the **same options object** as the provider:

```ts
// appearance-head.ts
import { initializeTheme } from '@apteva/ui-kit/theme';
import { appearanceOptions } from './appearance-options';
initializeTheme(appearanceOptions);
```

```sh
bun build appearance-head.ts --target browser --format iife --outfile public/appearance-head.js --minify
```

```html
<head>
  <script src="/appearance-head.js"></script>
  <!-- CSS and the application follow. Do not use async/defer/type=module here. -->
</head>
```

Keep shared options in a small module that imports no React or application code. The blocking classic script sets attributes before the body exists; the provider later attaches live listeners. Hosts retain control of their CSP. The framework-independent entry also exports `createThemeController()` for non-React applications: call `start()`, subscribe to snapshots, and call the returned cleanup when unmounting. React server rendering uses a deterministic default snapshot for hydration, then reads browser preferences on the client.

### Optional Tailwind v4 integration

Hosts that compile their own Tailwind CSS can omit `styles.css` and use:

```css
@import "tailwindcss";
@import "@apteva/ui-kit/theme.css";
@import "@apteva/ui-kit/tailwind.css";
@source "../node_modules/@apteva/ui-kit/dist/ui-kit.mjs";
@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
```

The bridge maps runtime tokens to semantic utilities such as `bg-bg-card`, `text-text`, and `border-border`. Your host owns Tailwind's reset, utilities, and scoping in this mode. The current dashboard continues using its existing CSS, provider, source scan, and importmap unchanged.

## Package and validation

Build output includes `dist/ui-kit.mjs` (the existing single-file dashboard/vendor entry), `theme.mjs`, `theme.css`, `styles.css`, the optional Tailwind bridge, source maps, and TypeScript declarations. Existing named exports and the AppHost API are preserved; React and JSX runtimes stay external.

```sh
bun install --frozen-lockfile
bun run validate
```

Validation checks types and unit tests, builds and syntax-checks the artifacts, then packs the package and installs it into an isolated app. Browser tests cover all palettes, provider mounting/cleanup, OS changes, persistence, cross-tab updates, blocked storage, scoped CSS, and initialization before the body or React exists. They also check the consumer's declarations and shared React resolution. On macOS the tests use installed Chrome; elsewhere run `bunx playwright install chromium` first.

When checked out beside `dashboard/` with its dependencies installed, browser tests compare component styles and palette tokens against the dashboard's actual CSS without editing it. Standalone repository checkouts run the same consumer suite without that optional comparison. Screenshots are saved in `test-results/`.
