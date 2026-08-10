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
  },
      
});