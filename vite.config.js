import { resolve } from 'path';
import { globSync } from 'glob';
import { defineConfig } from 'vite';

// Dynamic input generation
const inputs = globSync('**/*.html', {
  ignore: ['node_modules/**', 'dist/**'],
}).reduce((entries, file) => {
  const name = file.replace(/\\/g, '/').replace(/\.html$/, '');
  entries[name] = resolve(__dirname, file);
  return entries;
}, {});

export default defineConfig({
  root: '.',
  server: {
    port: 5500,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: inputs
    }
  }
});
