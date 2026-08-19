/**
 * Build config used only to produce a standalone bundle of the 3D laboratory
 * for headless screenshots. Relative base so it loads over file://.
 * Not part of the application build. Safe to delete.
 */
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), './src') },
  },
  build: {
    outDir: 'dist-labshot',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(process.cwd(), 'labshot.html'),
    },
  },
});
