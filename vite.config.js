import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // base: '/react-personal-website/',
  // publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // rollupOptions: {
    //   input: {
    //     main: resolve(__dirname, 'index.html'),
    //   },
    //   output: {
    //     assetFileNames: (assetInfo) => {
    //       // Keep PDF files in the root directory
    //       if (assetInfo.name.endsWith('.pdf')) {
    //         return '[name][extname]';
    //       }
    //       return 'assets/[name]-[hash][extname]';
    //     },
    //   },
    // },
    sourcemap: true,
    // Ensure CSS is extracted and assets are handled
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Enable SPA fallback
  server: {
    historyApiFallback: true,
  }
})