import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    root: 'web',
    build: {
      outDir: '../public',
      assetsDir: 'dist',
    },
    base: env.STATIC_BASE_URL,
    define: {
      __STATIC_BASE_URL__: JSON.stringify(env.STATIC_BASE_URL),
    },
  };
});
