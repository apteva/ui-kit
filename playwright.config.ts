import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:43817',
    headless: true,
    // Local Chrome avoids a separate browser download. CI uses installed Chromium.
    ...(process.platform === 'darwin' ? { channel: 'chrome' } : {}),
  },
  webServer: { command: 'bun tests/consumer-server.ts', url: 'http://127.0.0.1:43817', timeout: 120_000 },
});
