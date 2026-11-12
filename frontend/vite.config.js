import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let target = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';
  if (!env.VITE_API_PROXY_TARGET && /^https?:/.test(env.VITE_API_URL || '')) {
    target = new URL(env.VITE_API_URL).origin;
  }
  return {
    plugins: [react()],
    server: {
      host: env.VITE_DEV_HOST || 'localhost',
      port: Number(env.VITE_PORT) || 5173,
      strictPort: true,
      proxy: { '/api': { target, changeOrigin: true } }
    }
  };
});
