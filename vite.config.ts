import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/nihongo/',
  // Version affichée dans les réglages : la date de la mise en ligne.
  define: { __VERSION__: JSON.stringify(new Date().toISOString().slice(0, 10).replaceAll('-', '.')) },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // Enregistrement fait dans src/main.ts (rechargement auto + vérification au retour sur l'app).
      injectRegister: false,
      includeAssets: ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png'],
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Murecho est découpée en ~120 morceaux : seuls ceux affichés sont téléchargés, puis gardés en cache.
        globIgnores: ['**/murecho-*.woff2'],
        runtimeCaching: [
          {
            urlPattern: /murecho-.*\.woff2$/,
            handler: 'CacheFirst',
            options: { cacheName: 'polices', expiration: { maxEntries: 150 } },
          },
        ],
      },
      manifest: {
        name: 'Nihongo — révisions',
        short_name: 'Nihongo',
        lang: 'fr',
        display: 'standalone',
        background_color: '#ffd400',
        theme_color: '#ffd400',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { include: ['tests/**/*.test.ts'] },
})
