import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    // Proxy /api requests to avoid CORS in development.
    // Set VITE_NIGHTSCOUT_URL in .env.local to your Nightscout instance.
    // Example: VITE_NIGHTSCOUT_URL=https://my-site.herokuapp.com
    proxy: process.env.VITE_NIGHTSCOUT_URL ? {
      '/api': {
        target: process.env.VITE_NIGHTSCOUT_URL,
        changeOrigin: true,
        secure: true,
      },
    } : undefined,
  },
})
