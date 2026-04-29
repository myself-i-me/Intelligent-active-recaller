import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works under any GitHub Pages subpath
// without needing to hardcode the repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
});
