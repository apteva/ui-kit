import { join } from "node:path";
import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT_DIR = join(ROOT, "dist");
await mkdir(OUT_DIR, { recursive: true });

// Keep the dashboard importmap's single-file contract, with React external.
// Do not mark all JS as side-effect-free in package.json: Bun 1.3.13 can
// otherwise discard barrel implementations and emit undefined exports.
for (const [entry, naming] of [["index.ts", "ui-kit.mjs"], ["theme.ts", "theme.mjs"]]) {
  const result = await Bun.build({
    entrypoints: [join(ROOT, "src", entry)], outdir: OUT_DIR,
    target: "browser", format: "esm", minify: true, sourcemap: "external",
    external: ["react", "react/jsx-runtime", "react/jsx-dev-runtime"],
    define: { "process.env.NODE_ENV": '"production"' }, naming,
  });
  if (!result.success) throw new AggregateError(result.logs, `${entry} build failed`);
  // A successful bundler exit alone did not catch the broken barrel.
  // Validate using Bun alone so the dashboard's oven/bun Docker build keeps
  // working without a separately installed Node executable.
  const built = await import(join(OUT_DIR, naming));
  const names = entry === "index.ts"
    ? ["Card", "ThemeProvider", "useColorMode", "AgentMark", "connectAppHost", "isHostUIRequest"]
    : ["initializeTheme", "createThemeController"];
  for (const name of names) if (typeof built[name] !== "function") throw new Error(`Missing export: ${name}`);
  const imports = new Bun.Transpiler({ loader: "js" }).scanImports(await readFile(join(OUT_DIR, naming), "utf8"));
  if (entry === "theme.ts" && imports.length) throw new Error("Theme initializer must have no runtime dependencies");
  if (entry === "index.ts" && !imports.some(item => item.path === "react")) throw new Error("React must remain external");
}

const themeCSS = await Bun.build({
  entrypoints: [join(ROOT, "src/theme.css")], outdir: OUT_DIR, target: "browser", minify: true,
});
if (!themeCSS.success) throw new AggregateError(themeCSS.logs, "theme CSS build failed");
await copyFile(join(ROOT, "src/tailwind.css"), join(OUT_DIR, "tailwind.css"));

for (const command of [
  ["bun", join(ROOT, "node_modules/@tailwindcss/cli/dist/index.mjs"), "-i", join(ROOT, "src/styles.css"), "-o", join(OUT_DIR, "styles.css"), "--minify"],
  ["bun", join(ROOT, "node_modules/typescript/bin/tsc"), "-p", join(ROOT, "tsconfig.build.json")],
]) {
  const child = Bun.spawn(command, { cwd: ROOT, stdout: "inherit", stderr: "inherit" });
  if (await child.exited !== 0) throw new Error("UI Kit stylesheet/types build failed");
}

// Scope generated utilities and property fallbacks, including media/supports
// rules. The explicitly scoped baseline above stays at zero specificity.
const stylesheet = postcss.parse(await readFile(join(OUT_DIR, "styles.css"), "utf8"));
// Inherit themed radii from html; Tailwind defaults on the wrapper would win
// over inherited custom properties even when the html rule has higher priority.
stylesheet.walkDecls(/^--radius-(sm|md|lg)$/, declaration => { declaration.remove(); });
stylesheet.walkRules(rule => {
  if (rule.selector.includes(".apteva-ui") || rule.selector.includes(".apteva-page")) return;
  if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map(selector =>
    selector === ":root" || selector === ":host"
      ? ":where(.apteva-ui)"
      : `:where(.apteva-ui) ${selector}`,
  );
});
await writeFile(join(OUT_DIR, "styles.css"), stylesheet.toString());
console.log("✓ UI Kit, React-independent theme, scoped CSS and declarations built.");
