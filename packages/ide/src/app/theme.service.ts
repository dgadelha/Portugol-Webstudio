import { DOCUMENT } from "@angular/common";
import { ApplicationRef, inject, Service } from "@angular/core";
import { Meta } from "@angular/platform-browser";
import { Observable, of, switchMap } from "rxjs";
import { settings, ThemePreference } from "../settings";
import { BrowserThemeService } from "./browser-theme.service";
import { SettingsService } from "./settings.service";

export type Theme = "light" | "dark";

@Service()
export class ThemeService {
  private browserTheme = inject(BrowserThemeService);
  private settings = inject(SettingsService);

  ref = inject(ApplicationRef);
  document = inject(DOCUMENT);
  meta = inject(Meta);

  theme$ = this.settings.observe(settings.theme).pipe(
    switchMap<ThemePreference, Observable<Theme>>(pref => {
      if (pref === "light" || pref === "dark") {
        return of(pref);
      }

      return this.browserTheme.theme$;
    }),
  );

  constructor() {
    this.theme$.subscribe(theme => {
      this.document.body.dataset.theme = theme;

      // A barra de título do app instalado e as barras do Safari acompanham a moldura em
      // volta da área arredondada
      const frame = getComputedStyle(this.document.body).getPropertyValue("--pws-bg-frame").trim();

      if (frame) {
        this.meta.updateTag({ name: "theme-color", content: frame });
      }

      this.ref.tick();
    });
  }
}
