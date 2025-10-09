import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";

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
    esbuild: {
      drop: 'production' === mode ? ['console', 'debugger'] : [],
    },
    base: env.STATIC_BASE_URL,
    define: {
      __STATIC_BASE_URL__: JSON.stringify(env.STATIC_BASE_URL),
    },
    resolve: {
      alias: {
        "@domain": path.resolve(__dirname, "src/domain"),
        "@data": path.resolve(__dirname, "src/data"),
        "@view": path.resolve(__dirname, "src/view"),
        "@ui": path.resolve(__dirname, "src/ui"),
      },
    },
  };
});
