import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow access from TV on same network
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    // Optimize for TV: single bundle, no code splitting
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // WASM support
  optimizeDeps: {
    exclude: ['@tv-app/wasm-engine'],
  },
});
