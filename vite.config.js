import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7003,
    strictPort: true,
    host: true,
    allowedHosts: ['doctors.docapp.co.in'],
    hmr: {
      host: 'doctors.docapp.co.in', // Directs the browser HMR websocket to your domain
      protocol: 'wss', // Uses secure websockets if your site is served over HTTPS
      clientPort: 443, // Standard HTTPS port used by Nginx/reverse proxy
    },
  },
      
});