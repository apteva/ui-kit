// Install the actual release tarball in an isolated app, never source aliases.
import { mkdtempSync, copyFileSync, writeFileSync, readFileSync, realpathSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const root = resolve(import.meta.dir, '..');
const app = mkdtempSync(join(tmpdir(), 'apteva-ui-consumer-'));
function run(cmd: string[], cwd = app) {
  const result = Bun.spawnSync(cmd, { cwd, stdout: 'pipe', stderr: 'pipe' });
  if (result.exitCode) throw new Error(`${cmd[0]} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout.toString().trim();
}
const filename = run(['bun', 'pm', 'pack', '--ignore-scripts', '--quiet', '--destination', app], root).split('\n').at(-1)!;
writeFileSync(join(app, 'package.json'), JSON.stringify({
  name: 'standalone-consumer', private: true, type: 'module',
  dependencies: { '@apteva/ui-kit': join(app, filename.split('/').at(-1)!), react: '19.2.4', 'react-dom': '19.2.4' },
  devDependencies: { '@types/react': '^19.2.14', '@types/react-dom': '^19.2.3' },
}));
for (const filename of ['main.tsx', 'bootstrap.ts']) copyFileSync(join(root, 'tests/consumer', filename), join(app, filename));
writeFileSync(join(app, 'tsconfig.json'), JSON.stringify({
  compilerOptions: { strict: true, noEmit: true, module: 'ESNext', moduleResolution: 'bundler', target: 'ES2022', jsx: 'react-jsx', lib: ['ES2022', 'DOM'], skipLibCheck: true },
  include: ['*.ts', '*.tsx'],
}));
run(['bun', 'install']);
run(['bun', join(root, 'node_modules/typescript/bin/tsc'), '-p', app]);
const appRequire = createRequire(join(app, 'package.json'));
const kitRequire = createRequire(join(app, 'node_modules/@apteva/ui-kit/package.json'));
if (realpathSync(appRequire.resolve('react')) !== realpathSync(kitRequire.resolve('react'))) throw new Error('Consumer resolved two React runtimes');
const module = await import(join(app, 'node_modules/@apteva/ui-kit/dist/ui-kit.mjs'));
for (const name of ['Card', 'ThemeProvider', 'useTheme', 'useColorMode', 'connectAppHost', 'isHostUIRequest', 'AgentMark']) {
  if (typeof module[name] !== 'function') throw new Error(`Missing packaged export: ${name}`);
}
for (const [entry, format] of [['main.tsx', 'esm'], ['bootstrap.ts', 'iife']] as const) {
  const result = await Bun.build({
    entrypoints: [join(app, entry)], outdir: join(app, 'dist'), target: 'browser', format,
    sourcemap: 'external', define: { 'process.env.NODE_ENV': '"production"' },
  });
  if (!result.success) throw new AggregateError(result.logs, 'Standalone build failed');
}
const bootstrap = readFileSync(join(app, 'dist/bootstrap.js'), 'utf8');
if (/react[\/-]/i.test(bootstrap)) throw new Error('Pre-paint initializer includes React');

// When checked out beside the dashboard, compare against its actual unchanged
// CSS build. Isolated package checkouts still run every standalone browser test.
const dashboard = join(root, '../dashboard');
const cli = join(dashboard, 'node_modules/@tailwindcss/cli/dist/index.mjs');
const reference = existsSync(cli) && existsSync(join(dashboard, 'src/index.css'));
if (reference) run(['bun', cli, '-i', join(dashboard, 'src/index.css'), '-o', join(app, 'dist/dashboard.css'), '--minify'], dashboard);

const server = Bun.serve({
  port: 43817, hostname: '127.0.0.1',
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/metadata') return Response.json({ reference, reactShared: true, version: module ? JSON.parse(readFileSync(join(app, 'node_modules/@apteva/ui-kit/package.json'), 'utf8')).version : null });
    if (url.pathname === '/') return new Response(`<!doctype html><html><head><meta charset="utf-8"><script>${bootstrap}</script><link rel="stylesheet" href="/${url.searchParams.has('reference') ? 'dashboard' : 'main'}.css"><style>body{margin:0}#outside{font-family:serif}</style></head><body><div id="root"></div><script type="module" src="/main.js"></script></body></html>`, { headers: { 'content-type': 'text/html' } });
    const filename = url.pathname.slice(1);
    if (!['main.js', 'main.css', 'dashboard.css'].includes(filename)) return new Response('Not found', { status: 404 });
    return new Response(Bun.file(join(app, 'dist', filename)));
  },
});
console.log(`Packed consumer ${app}; dashboard comparison: ${reference}; ${server.url}`);
function stop() { server.stop(true); rmSync(app, { recursive: true, force: true }); process.exit(0); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
