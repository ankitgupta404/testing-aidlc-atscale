import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 6174,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
  resolve: {
    alias: {
      "@aws-news-hub/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  build: {
    outDir: "dist",
    // Reduce concurrency to avoid EMFILE
    rollupOptions: {
      maxParallelFileOps: 20,
    },
  },
});
