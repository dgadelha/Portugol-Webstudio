import { inject, Service } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { map, startWith } from "rxjs";
import { defaultFontSize, SettingsKey } from "../settings";

@Service()
export class SettingsService {
  private localStorageSvc = inject(LocalStorageService);

  editorFontSize = this.localStorageSvc.observe(SettingsKey.EditorFontSize).pipe(
    startWith(this.localStorageSvc.retrieve(SettingsKey.EditorFontSize)),
    map(value => Number.parseInt(value, 10) || defaultFontSize),
  );

  editorWordWrap = this.localStorageSvc
    .observe(SettingsKey.EditorWordWrap)
    .pipe(startWith(this.localStorageSvc.retrieve(SettingsKey.EditorWordWrap)), map(Boolean));
}
