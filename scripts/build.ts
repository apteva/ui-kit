// Build @apteva/ui-kit into a single ESM bundle the dashboard can
// serve as a peer module. React + react/jsx-runtime stay external so
// the host's vendor importmap resolves them — same trick every panel
// already uses, see apps/scripts/build-panels.ts.

import { join, dirname } from "path";
import { mkdir } from "fs/promises";

const ROOT = new URL("..", import.meta.url).pathname;
const ENTRY = join(ROOT, "src/index.ts");
const OUT_DIR = join(ROOT, "dist");

await mkdir(OUT_DIR, { recursive: true });

const result = await Bun.build({
  entrypoints: [ENTRY],
  outdir: OUT_DIR,
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "external",
  external: ["react", "react/jsx-runtime", "react/jsx-dev-runtime"],
  define: { "process.env.NODE_ENV": '"production"' },
  naming: "ui-kit.mjs",
});

if (!result.success) {
  console.error("ui-kit build failed:");
  for (const log of result.logs) console.error("  ", log);
  process.exit(1);
}

const out = result.outputs.find((o) => o.path.endsWith(".mjs"));
const size = out ? (out.size / 1024).toFixed(1) + " KB" : "?";
console.log(`✓ ${ENTRY.replace(ROOT, "")} → dist/ui-kit.mjs (${size})`);
