import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import * as Sentry from "@sentry/angular-ivy";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

Sentry.init({
  dsn: "https://620518162f784d2aa3e3ee7223d08594@o1070945.ingest.sentry.io/6067438",
  debug: false,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 0.1,
  integrations: [new Sentry.Replay(), new Sentry.BrowserTracing()],
});

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
