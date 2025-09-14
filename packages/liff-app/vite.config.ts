import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@shared": resolve(__dirname, "../shared/src"),
    },
  },
  define: {
    'process.env.VITE_APP_MODE': JSON.stringify('liff'),
    'process.env.VITE_LIFF_ID': JSON.stringify(process.env.VITE_LIFF_ID),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          liff: ['@line/liff'],
        }
      }
    }
  },
  server: {
    port: 3000,
    https: true, // Required for LIFF
    host: '0.0.0.0'
  }
})