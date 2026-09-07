import { Service } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Service()
export class BrowserThemeService {
  theme: "light" | "dark";
  theme$;

  constructor() {
    const isLight = globalThis.window.matchMedia?.("(prefers-color-scheme: light)").matches;

    this.theme = isLight ? "light" : "dark";
    this.theme$ = new BehaviorSubject<"light" | "dark">(this.theme);

    globalThis.window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", event => {
      if (event.matches) {
        this.theme = "light";
      } else {
        this.theme = "dark";
      }

      this.theme$.next(this.theme);
    });
  }
}
