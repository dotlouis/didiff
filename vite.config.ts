import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'didiff',
        short_name: 'didiff',
        description: 'Local paste-to-paste diff checker',
        theme_color: '#0b0d10',
        background_color: '#0b0d10',
        display: 'standalone',
        // Prefer Window Controls Overlay when installed on desktop
        // @see https://web.dev/articles/window-controls-overlay
        display_override: ['window-controls-overlay', 'standalone'],
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}'],
        maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ['@pierre/diffs', '@pierre/diffs/react'],
  },
  server: {
    port: 4173,
    strictPort: false,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
})
