import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.js.org/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  build: {
    cssMinify: false,
    outDir: 'dist',
  },
});
