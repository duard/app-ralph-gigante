/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_SANKHYA_API_URL: string;
  readonly VITE_SANKHYA_AUTH_URL: string;
  readonly VITE_SANKHYA_WS_URL: string;
  readonly VITE_AUTH_PERSIST: string;
  readonly VITE_AUTH_STORAGE_KEY: string;
  readonly VITE_REFRESH_TOKEN_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_ENABLE_DARK_MODE: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_DEFAULT_PAGE_SIZE: string;
  readonly VITE_MAX_PAGE_SIZE: string;
  readonly VITE_MAX_UPLOAD_SIZE: string;
  readonly VITE_ALLOWED_IMAGE_TYPES: string;
  readonly VITE_CACHE_TTL: string;
  readonly VITE_ENABLE_CACHE: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __APP__?: {
      version: string;
    };
  }
}

export {};
