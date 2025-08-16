import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://zemondev.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-scroll-area', '@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'tiptap-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-blockquote', '@tiptap/extension-bubble-menu', '@tiptap/extension-bullet-list', '@tiptap/extension-code-block', '@tiptap/extension-code-block-lowlight', '@tiptap/extension-color', '@tiptap/extension-dropcursor', '@tiptap/extension-floating-menu', '@tiptap/extension-gapcursor', '@tiptap/extension-hard-break', '@tiptap/extension-heading', '@tiptap/extension-highlight', '@tiptap/extension-history', '@tiptap/extension-horizontal-rule', '@tiptap/extension-image', '@tiptap/extension-link', '@tiptap/extension-list-item', '@tiptap/extension-ordered-list', '@tiptap/extension-paragraph', '@tiptap/extension-placeholder', '@tiptap/extension-subscript', '@tiptap/extension-superscript', '@tiptap/extension-table', '@tiptap/extension-table-cell', '@tiptap/extension-table-header', '@tiptap/extension-table-row', '@tiptap/extension-task-item', '@tiptap/extension-task-list', '@tiptap/extension-text', '@tiptap/extension-text-align', '@tiptap/extension-text-style', '@tiptap/extension-typography', '@tiptap/extension-underline'],
          'animation-vendor': ['framer-motion', 'gsap', '@gsap/react'],
          'media-vendor': ['@giphy/js-fetch-api', '@giphy/react-components', 'swiper'],
          'utils-vendor': ['axios', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          'clerk-vendor': ['@clerk/clerk-react'],
        },
      },
    },
    chunkSizeWarningLimit: 2300,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'gsap',
      '@gsap/react',
      'axios',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
      '@clerk/clerk-react'
    ],
  },
})
