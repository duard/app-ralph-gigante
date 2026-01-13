import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        react: path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom', '@radix-ui/react-context'],
    },
    define: {
      'import.meta.env.VITE_BASENAME': JSON.stringify(process.env.VITE_BASENAME || ''),
    },
    server: {
      port: 5173,
      host: true,
      open: true,
      fs: {
        strict: false,
      },
      proxy: {
        '/api': {
          target: env.VITE_SANKHYA_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: env.VITE_SANKHYA_WS_URL || 'ws://localhost:3000/ws',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: {
        overlay: true,
        port: 5173,
      },
      watch: {
        usePolling: false,
        ignored: [
          '!**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/coverage/**',
          '**/test-results/**',
          '**/.storybook/**',
          '**/*.log',
          '**/pnpm-lock.yaml',
          '**/package-lock.json',
          '**/yarn.lock',
        ],
        followSymlinks: false,
      },
    },
    build: {
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      target: 'esnext',
      cssCodeSplit: true,
      // Optimize rebuild performance
      emptyOutDir: true,
      // Reduce chunk size warnings for better DX
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor libraries - third-party dependencies
            if (id.includes('node_modules')) {
              // React ecosystem
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router-dom')
              ) {
                return 'react-vendor';
              }

              // UI components library
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }

              // Charts and visualization
              if (id.includes('recharts') || id.includes('d3')) {
                return 'charts-vendor';
              }

              // Form handling and validation
              if (id.includes('react-hook-form') || id.includes('zod')) {
                return 'forms-vendor';
              }

              // State management and utilities
              if (id.includes('zustand') || id.includes('date-fns') || id.includes('axios')) {
                return 'utils-vendor';
              }

              // Animation libraries
              if (id.includes('framer-motion')) {
                return 'animation-vendor';
              }

              // PDF/Excel export libraries
              if (id.includes('jspdf') || id.includes('xlsx')) {
                return 'export-vendor';
              }

              // Other vendor libraries
              return 'vendor';
            }

            // Route-based code splitting
            if (id.includes('/src/app/')) {
              // Dashboard and core pages
              if (
                id.includes('/dashboard/') ||
                id.includes('/bem-vindo/') ||
                id.includes('/landing/')
              ) {
                return 'dashboard';
              }

              // Product management
              if (id.includes('/produtos/')) {
                return 'produtos';
              }

              // Authentication pages
              if (id.includes('/auth/')) {
                return 'auth';
              }

              // Settings pages
              if (id.includes('/settings/')) {
                return 'settings';
              }

              // Error pages
              if (id.includes('/errors/')) {
                return 'errors';
              }

              // Communication features
              if (id.includes('/mail/') || id.includes('/chat/') || id.includes('/calendar/')) {
                return 'communication';
              }

              // Task management
              if (id.includes('/tasks/')) {
                return 'tasks';
              }

              // User and content management
              if (id.includes('/users/') || id.includes('/faqs/') || id.includes('/pricing/')) {
                return 'content';
              }

              // Default chunk for other routes
              return 'routes';
            }
          },
          chunkFileNames: (chunkInfo) => {
            // Route chunks get more descriptive names
            if (
              chunkInfo.name === 'dashboard' ||
              chunkInfo.name === 'produtos' ||
              chunkInfo.name === 'auth' ||
              chunkInfo.name === 'settings' ||
              chunkInfo.name === 'errors' ||
              chunkInfo.name === 'communication' ||
              chunkInfo.name === 'tasks' ||
              chunkInfo.name === 'content' ||
              chunkInfo.name === 'routes'
            ) {
              return 'assets/routes/[name]-[hash].js';
            }
            // Vendor chunks
            return 'assets/js/[name]-[hash].js';
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? '';
            const ext = name.split('.').pop() ?? '';
            if (ext === 'css') return 'assets/css/[name]-[hash][extname]';
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            return 'assets/[ext]/[name]-[hash][extname]';
          },
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      reportCompressedSize: false,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'date-fns',
        '@radix-ui/react-context',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-tabs',
        '@radix-ui/react-tooltip',
        '@tanstack/react-table',
        '@tanstack/react-virtual',
        'framer-motion',
        'recharts',
        'lucide-react',
        'axios',
        'react-hook-form',
        'zod',
        'sonner',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
      ],
      exclude: ['@tanstack/react-query-devtools'],
      // Force optimization even when dependencies are linked
      force: false,
      // Add pre-bundling for better performance
      prebundleDependencies: true,
    },
    assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
    // Improve build performance with esbuild optimizations
    esbuild: {
      target: 'esnext',
      // Drop console and debugger in production for smaller bundle
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // Optimize for modern browsers
      supported: {
        'top-level-await': true,
      },
    },
  };
});
