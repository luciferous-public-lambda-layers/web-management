/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAME_DYNAMODB_TABLE: string;
  readonly VITE_REGION: string;
  readonly VITE_ID_IDENTITY_POOL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
