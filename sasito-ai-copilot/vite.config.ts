import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(async ({mode}) => {
  const env = loadEnv(mode, '.', '');
  let tailwindPlugin: (() => unknown) | null = null;

  try {
    const tailwindModule = await import('@tailwindcss/vite');
    tailwindPlugin = tailwindModule.default;
  } catch {
    // Allow this nested sample app to boot even when its optional Tailwind plugin
    // has not been installed in the parent workspace.
  }

  return {
    plugins: [react(), ...(tailwindPlugin ? [tailwindPlugin()] : [])],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
