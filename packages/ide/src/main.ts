import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import * as Sentry from "@sentry/angular";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

Sentry.init({
  enabled: environment.production,
  dsn: "https://620518162f784d2aa3e3ee7223d08594@o1070945.ingest.sentry.io/6067438",
  debug: false,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 0.1,
  release: "%SENTRY_RELEASE%",
  integrations: [
    Sentry.replayIntegration({
      maskAllInputs: false,
      maskAllText: false,
    }),
    Sentry.extraErrorDataIntegration(),
    Sentry.sessionTimingIntegration(),
    Sentry.browserTracingIntegration(),
  ],
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    try {
      /** @see https://stackoverflow.com/a/51059335 */
      if ("serviceWorker" in navigator && environment.production) {
        void navigator.serviceWorker.register("/ngsw-worker.js");
      }
    } catch (error: unknown) {
      console.error("Service worker registration failed:", error);
    }
  })
  .catch((error: unknown) => {
    console.error(error);
  });
