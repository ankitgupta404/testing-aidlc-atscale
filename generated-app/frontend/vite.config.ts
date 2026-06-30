import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 6174,
    host: '0.0.0.0',
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      maxParallelFileOps: 50,
    },
  },
  resolve: {
    alias: {
      '@aws-news-hub/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});
