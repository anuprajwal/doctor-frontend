import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7000,
    strictPort: true,
    host: true
  },
      allowedHosts: ['.docapp.co.in', 'users.docapp.co.in'], // Allows Vite to accept requests from your domain

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});