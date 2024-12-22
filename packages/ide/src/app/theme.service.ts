import { DOCUMENT } from "@angular/common";
import { ApplicationRef, inject, Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { Observable, of, startWith, switchMap } from "rxjs";
import { BrowserThemeService } from "./browser-theme.service";

export type Theme = "light" | "dark";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private browserTheme = inject(BrowserThemeService);
  private localStorageSvc = inject(LocalStorageService);

  ref = inject(ApplicationRef);
  document = inject(DOCUMENT);

  theme = this.localStorageSvc.observe("theme").pipe(
    startWith(this.localStorageSvc.retrieve("theme") || "auto"),
    switchMap<string, Observable<Theme>>(pref => {
      if (pref === "light" || pref === "dark") {
        return of(pref as Theme);
      } else {
        return this.browserTheme.theme$;
      }
    }),
  );

  constructor() {
    this.theme.subscribe(theme => {
      this.document.body.dataset.theme = theme;
      this.ref.tick();
    });
  }
}
