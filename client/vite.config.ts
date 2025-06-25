import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          motion: ['framer-motion']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@chakra-ui/react']
  }
})
