import { enableProdMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import * as Sentry from "@sentry/angular";

import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";
import { APP_VERSION } from "./app/version";
import { environment } from "./environments/environment";

Sentry.init({
  enabled: environment.production,
  dsn: "https://620518162f784d2aa3e3ee7223d08594@o1070945.ingest.sentry.io/6067438",
  debug: false,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 0.1,
  release: APP_VERSION.commit ?? "local",
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

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
  console.error(error);
});
