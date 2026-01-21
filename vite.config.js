import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5500,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        dashboard: './dashboard.html',
        admin: './admin.html',
        testPlay: './test-play.html',
        review: './review.html'
      }
    }
  }
});
