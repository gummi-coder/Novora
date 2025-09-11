import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Environment-specific configuration
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  const isStaging = mode === 'staging';
  
  // API configuration based on environment
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8000';
  const enableProxy = env.VITE_DEV_PROXY === 'true' && isDevelopment;
  
  return {
      // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
    __APP_ENVIRONMENT__: JSON.stringify(mode),
    __PROFILE__: JSON.stringify(env.VITE_PROFILE || 'FULL'),
    __FEATURE_OWNER__: env.VITE_FEATURE_OWNER === 'true',
    __FEATURE_ADMIN__: env.VITE_FEATURE_ADMIN === 'true',
    __FEATURE_PRO__: env.VITE_FEATURE_PRO === 'true',
    __FEATURE_PREDICTIVE__: env.VITE_FEATURE_PREDICTIVE === 'true',
    __FEATURE_PHOTO__: env.VITE_FEATURE_PHOTO === 'true',
    __FEATURE_AUTOPILOT__: env.VITE_FEATURE_AUTOPILOT === 'true',
    __FEATURE_EXPORTS__: env.VITE_FEATURE_EXPORTS === 'true',
    __FEATURE_ENPS__: env.VITE_FEATURE_ENPS === 'true',
    __FEATURE_ADVANCED_ANALYTICS__: env.VITE_FEATURE_ADVANCED_ANALYTICS === 'true',
    __FEATURE_INTEGRATIONS__: env.VITE_FEATURE_INTEGRATIONS === 'true',
    __FEATURE_NLP__: env.VITE_FEATURE_NLP === 'true',
  },
    
    server: {
      host: "localhost",
      port: 3000,
      strictPort: true,
      open: true,
      // Proxy configuration for development
      proxy: enableProxy ? {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        '/auth': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        '/uploads': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        // Legacy proxy for old structure
        '/User Dashbord': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/User Dashbord/, '')
        }
      } : undefined,
    },
    
    plugins: [
      react(),
    ],
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: {
        output: {
          // Simple chunking without specific file references
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
    
    // Environment-specific optimizations
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: isDevelopment ? [] : ['@/components/ui'],
    },
    
    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
    },
    
    // Environment variables
    envPrefix: 'VITE_',
    
    // Development server configuration
    preview: {
      port: 4173,
      host: true,
    },
  };
});
