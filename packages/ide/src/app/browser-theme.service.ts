import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class BrowserThemeService {
  theme: "light" | "dark";
  theme$;

  constructor() {
    const isLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;

    this.theme = isLight ? "light" : "dark";
    this.theme$ = new BehaviorSubject<"light" | "dark">(this.theme);

    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", event => {
      if (event.matches) {
        this.theme = "light";
      } else {
        this.theme = "dark";
      }

      this.theme$.next(this.theme);
    });
  }
}
