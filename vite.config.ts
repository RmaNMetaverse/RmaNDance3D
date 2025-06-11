import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

const copyAssetsPlugin: Plugin = {
  name: 'copy-assets',
  closeBundle: async () => {
    // Create assets directory if it doesn't exist
    const assetsDir = path.resolve('docs/assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Copy GLB files from assets to docs/assets
    const sourceDir = path.resolve('assets');
    if (fs.existsSync(sourceDir)) {
      const files = fs.readdirSync(sourceDir);
      files.forEach(file => {
        if (file.endsWith('.glb')) {
          fs.copyFileSync(
            path.join(sourceDir, file),
            path.join(assetsDir, file)
          );
        }
      });
    }
  }
};

export default defineConfig({
  base: './', // This ensures assets are loaded correctly in GitHub Pages
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
  },
  publicDir: false, // Disable default public directory behavior
  assetsInclude: ['**/*.glb'], // Explicitly include GLB files as assets
  plugins: [copyAssetsPlugin]
}); 