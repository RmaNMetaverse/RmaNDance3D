import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // This ensures assets are loaded correctly in GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
}); 