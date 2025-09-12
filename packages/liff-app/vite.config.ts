import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared/src'),
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.VITE_APP_MODE': JSON.stringify('liff'),
    'process.env.VITE_LIFF_ID': JSON.stringify(process.env.VITE_LIFF_ID),
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // LIFF doesn't need sourcemaps
  },
  server: {
    port: 3000,
    https: true, // LIFF requires HTTPS
  },
});
