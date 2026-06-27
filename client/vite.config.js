import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3100,
    strictPort: true,
    allowedHosts: ['verdikt.franco-software.com'],
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3101',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
