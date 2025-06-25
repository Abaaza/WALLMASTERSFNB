import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxImportSource: '@emotion/react',
    babel: {
      plugins: ['@emotion/babel-plugin']
    }
  })],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@emotion')) {
              return 'emotion';
            }
            if (id.includes('@chakra-ui')) {
              return 'chakra';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            return 'vendor';
          }
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
    include: ['@emotion/react', '@emotion/styled', '@chakra-ui/react']
  }
})
