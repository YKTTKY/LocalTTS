import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: './src/popup.tsx', // Relative path
        content: './src/content.ts', // Relative path
        background: './src/background.ts', // Relative path
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  publicDir: 'public',
});