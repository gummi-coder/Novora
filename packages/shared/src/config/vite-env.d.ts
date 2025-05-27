/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEBUG: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_FEATURE_X: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly VITE_DEFAULT_LOCALE: string;
  readonly VITE_SUPPORTED_LOCALES?: string;
  readonly VITE_DEFAULT_THEME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 