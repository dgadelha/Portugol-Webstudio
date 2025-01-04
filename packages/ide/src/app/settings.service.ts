import { inject, Injectable } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { startWith } from "rxjs";

@Injectable({ providedIn: "root" })
export class SettingsService {
  private localStorageSvc = inject(LocalStorageService);

  editorFontSize = this.localStorageSvc
    .observe("editorFontSize")
    .pipe(startWith(this.localStorageSvc.retrieve("editorFontSize") || 12));

  editorWordWrap = this.localStorageSvc
    .observe("editorWordWrap")
    .pipe(startWith(this.localStorageSvc.retrieve("editorWordWrap") || false));
}
