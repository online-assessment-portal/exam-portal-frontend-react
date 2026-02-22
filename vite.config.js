import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // TODO: Temporary Fix for dependency issue - delete later
  optimizeDeps: {
    exclude: ['peerjs', 'socket.io-client', 'framer-motion'],
    include: ['sdp', 'debug', 'react-ace'],
    esbuildOptions: {
      mainFields: ['module', 'main'],
      conditions: ['import', 'module', 'default'],
    },
    force: true,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
  },
  // TODO: Temporary Fix for dependency issue - delete later
});
