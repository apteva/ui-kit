# Changelog

## 0.4.0

- Export standalone Terminal/Clean themes with dark/light palettes and an optional Tailwind bridge.
- Add ThemeProvider, useTheme, a React-independent theme controller, and blocking first-paint initialization.
- Add scoped component CSS and an opt-in page surface; hosts retain control of fonts, layout, and widget styles.
- Ship compiled package exports and TypeScript declarations while retaining the dashboard's single-file vendor bundle and existing AppHost API.
- Validate packed consumption in a separate React app, with real-browser appearance and preference tests and dashboard CSS comparisons.
- Fix a Bun barrel-build regression caused by package-wide side-effect pruning.
