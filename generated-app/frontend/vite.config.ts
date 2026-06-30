import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@canopy/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 6174,
    proxy: {
      '/api': {
        target: 'https://xcu2fdrr5f.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
