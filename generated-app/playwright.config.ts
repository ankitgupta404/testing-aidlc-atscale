import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:6174',
    headless: true,
  },
  webServer: {
    command: 'cd frontend && npx vite --host 0.0.0.0 --port 6174',
    port: 6174,
    reuseExistingServer: true,
  },
});
