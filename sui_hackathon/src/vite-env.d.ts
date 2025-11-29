/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUSHER_KEY?: string;
  readonly VITE_PUSHER_CLUSTER?: string;
  readonly VITE_SPONSOR_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_PROVING_SERVICE_URL?: string;
  readonly VITE_SALT_SERVICE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
