import { inject, Service } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { combineLatest, map, Observable, startWith } from "rxjs";
import { Setting, settings } from "../settings";

@Service()
export class SettingsService {
  private localStorageSvc = inject(LocalStorageService);

  /**
   * O valor atual da configuração e, depois, cada mudança.
   */
  observe<T>(setting: Setting<T>): Observable<T> {
    return this.localStorageSvc.observe(setting.key).pipe(
      startWith(this.localStorageSvc.retrieve(setting.key)),
      map(value => setting.parse(value)),
    );
  }

  get<T>(setting: Setting<T>): T {
    return setting.parse(this.localStorageSvc.retrieve(setting.key));
  }

  /**
   * Até ser alterado, o tamanho da fonte da saída acompanha o do editor.
   */
  outputFontSize() {
    return combineLatest([this.observe(settings.outputFontSize), this.observe(settings.editorFontSize)]).pipe(
      map(([outputFontSize, editorFontSize]) => outputFontSize ?? editorFontSize),
    );
  }

  /**
   * Um nível de indentação, do jeito que o editor está configurado agora.
   */
  editorIndentation() {
    return this.get(settings.editorInsertSpaces) ? " ".repeat(this.get(settings.editorTabSize)) : "\t";
  }
}
