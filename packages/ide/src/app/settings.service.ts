import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { map, startWith } from "rxjs";
import { defaultFontSize } from "../settings";

@Injectable({ providedIn: "root" })
export class SettingsService {
  private localStorageSvc = inject(LocalStorageService);

  editorFontSize = this.localStorageSvc.observe("editorFontSize").pipe(
    startWith(this.localStorageSvc.retrieve("editorFontSize")),
    map(value => Number.parseInt(value, 10) || defaultFontSize),
  );

  editorWordWrap = this.localStorageSvc
    .observe("editorWordWrap")
    .pipe(startWith(this.localStorageSvc.retrieve("editorWordWrap")), map(Boolean));
}
