import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: 'esm',
  minify: true,
  shims: true,
  outExtensions: () => ({ js: '.js' })
});
