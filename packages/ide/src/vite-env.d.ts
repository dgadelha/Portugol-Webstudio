/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /**
   * Commit do build, preenchido pelo CI (`VITE_COMMIT_SHA`).
   */
  readonly VITE_COMMIT_SHA?: string;
  /**
   * Data e hora do build, preenchida pelo CI (`VITE_BUILD_DATE`).
   */
  readonly VITE_BUILD_DATE?: string;
  /**
   * Release do Sentry, preenchida pelo CI (`VITE_SENTRY_RELEASE`).
   */
  readonly VITE_SENTRY_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
