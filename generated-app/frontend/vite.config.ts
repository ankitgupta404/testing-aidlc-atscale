import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'date-fns': path.resolve(__dirname, '../node_modules/date-fns'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 6174,
    host: '0.0.0.0',
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
});
