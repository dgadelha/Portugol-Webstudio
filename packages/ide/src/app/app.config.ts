import { provideHttpClient } from "@angular/common/http";
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getStorage, provideStorage } from "@angular/fire/storage";
import { provideServiceWorker } from "@angular/service-worker";
import { provideHotToastConfig } from "@ngxpert/hot-toast";
import * as Sentry from "@sentry/angular";
import { provideAngularSplitOptions } from "angular-split";
import { provideAngularSvgIcon } from "angular-svg-icon";
import { NgxGoogleAnalyticsModule } from "ngx-google-analytics";
import { MARKED_EXTENSIONS, provideMarkdown } from "ngx-markdown";
import { provideNgxWebstorage, withNgxWebstorageConfig } from "ngx-webstorage";

import { environment } from "../environments/environment";
import { withNgxLocalStorageFallback } from "../helpers/local-storage";
import { RELEASE_CHANNEL } from "./beta";
import { MonacoService } from "./monaco.service";
import { PwaService } from "./pwa.service";
import { markedPortugol } from "./tab-help/marked-portugol";
import { ThemeService } from "./theme.service";

const GA_TRACKING_CODE = "G-ZKM28VG4G5";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideStorage(() => getStorage()),
    provideHttpClient(),
    provideAngularSvgIcon(),
    // Divisores com um vão de 8px, como entre as áreas do VS Code (ver `styles/_split.scss`)
    provideAngularSplitOptions({ gutterSize: 8 }),
    provideHotToastConfig({
      position: "bottom-right",
      closeLabel: "Fechar aviso",
    }),
    provideNgxWebstorage(withNgxWebstorageConfig({ prefix: "pws", separator: ":" }), withNgxLocalStorageFallback()),
    importProvidersFrom(
      NgxGoogleAnalyticsModule.forRoot(GA_TRACKING_CODE, [
        // Parâmetros do `config` acompanham todos os eventos, inclusive o `page_view` automático.
        { command: "config", values: [GA_TRACKING_CODE, { app_channel: RELEASE_CHANNEL }] },
      ]),
    ),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      // Registra o service worker quando a aplicação fica estável, ou depois de 10 segundos.
      registrationStrategy: "registerWhenStable:10000",
    }),
    provideAppInitializer(() => {
      inject(MonacoService);
      inject(ThemeService);
      inject(PwaService);
    }),
    provideMarkdown({
      markedExtensions: [
        {
          provide: MARKED_EXTENSIONS,
          multi: true,
          useValue: {
            hooks: {
              // Links externos abrem em outra aba do navegador, sem tirar o usuário do IDE
              postprocess: (html: string) => {
                return html.replaceAll(
                  /<a href="(https?:\/\/)/g,
                  '<a target="_blank" rel="external noreferrer noopener nofollow" href="$1',
                );
              },
            },
          },
        },
        {
          provide: MARKED_EXTENSIONS,
          multi: true,
          useValue: markedPortugol,
        },
      ],
    }),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
  ],
};
