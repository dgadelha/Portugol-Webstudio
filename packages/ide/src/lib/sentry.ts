import * as Sentry from "@sentry/react";

import { BUILD_INFO, IS_PRODUCTION, SENTRY_DSN } from "@/config/env";

export function initSentry() {
  Sentry.init({
    enabled: IS_PRODUCTION,
    dsn: SENTRY_DSN,
    debug: false,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 0.1,
    release: BUILD_INFO.sentryRelease,
    integrations: [
      Sentry.replayIntegration({
        maskAllInputs: false,
        maskAllText: false,
      }),
      Sentry.extraErrorDataIntegration(),
      Sentry.browserTracingIntegration(),
    ],
    ignoreErrors: [/failed to fetch/i, /networkerror/i, /http failure response/i, /monaco-editor/i],
  });
}
