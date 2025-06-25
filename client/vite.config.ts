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
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  define: {
    'process.env': process.env
  }
})
