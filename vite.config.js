import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './config/tests/setupTests.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'all',
      '5173-i9m2xve7rf5alxsrpggsl-ead0671e.manusvm.computer',
      '.manusvm.computer'
    ]
  },
  assetsInclude: ['**/*.svg'],
  css: {
    postcss: {
      plugins: []
    }
  }
});
