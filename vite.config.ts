import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          name: "Lloyd Assistant",
          short_name: "Lloyd",
          description: "Tu asistente de IA flotante y transparente.",
          id: "/lloyd",
          start_url: "/lloyd",
          scope: "/",
          display: "standalone",
          display_override: ["window-controls-overlay", "minimal-ui", "standalone"],
          theme_color: "#050505",
          background_color: "#050505",
          orientation: "any",
          categories: ["productivity", "utilities"],
          icons: [
            {
              src: "https://picsum.photos/seed/lloyd/192/192",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "https://picsum.photos/seed/lloyd/512/512",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ],
          screenshots: [
            {
              src: "https://picsum.photos/seed/lloyd-screen/1280/720",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
              label: "Lloyd Assistant Desktop"
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
