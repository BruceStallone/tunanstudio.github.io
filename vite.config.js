import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        products: './page/product.html',
        team: './page/team.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/script'
    }
  }
});
