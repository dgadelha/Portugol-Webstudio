import { IS_BETA } from "./beta";

/**
 * Preenchidos no deploy (`.github/workflows/deploy.yml` e `deloy-beta.yml`): o commit
 * completo e a data do build em ISO 8601. No ambiente local, ficam como estão.
 */
const COMMIT = "%COMMIT_SHA%";
const BUILD_DATE = "%BUILD_DATE%";

const IS_LOCAL = COMMIT.startsWith("%");

export const APP_VERSION = {
  /**
   * Commit completo, para o Sentry e o link no GitHub; `null` no ambiente local.
   */
  commit: IS_LOCAL ? null : COMMIT,

  /**
   * O que aparece para o usuário: o commit curto, com `-BETA` no beta.
   */
  label: IS_LOCAL ? "local" : `${COMMIT.slice(0, 7)}${IS_BETA ? "-BETA" : ""}`,

  buildDate: IS_LOCAL ? null : new Date(BUILD_DATE),
};

export const APP_COMMIT_URL = APP_VERSION.commit
  ? `https://github.com/dgadelha/Portugol-Webstudio/commit/${APP_VERSION.commit}`
  : null;
