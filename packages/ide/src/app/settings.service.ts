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
   * As opções do editor de código que vêm das configurações.
   */
  editorOptions(): Observable<monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions> {
    return combineLatest([
      this.observe(settings.editorFontSize),
      this.observe(settings.editorWordWrap),
      this.observe(settings.editorTabSize),
      this.observe(settings.editorInsertSpaces),
      this.observe(settings.editorLineNumbers),
      this.observe(settings.editorMinimap),
      this.observe(settings.editorBracketPairColorization),
      this.observe(settings.editorIndentationGuides),
      this.observe(settings.editorRenderWhitespace),
      this.observe(settings.editorAutoClosing),
      this.observe(settings.editorCursorStyle),
      this.observe(settings.editorQuickSuggestions),
      this.observe(settings.editorRenderLineHighlight),
      this.observe(settings.editorFolding),
      this.observe(settings.editorStickyScroll),
    ]).pipe(
      map(
        ([
          fontSize,
          wordWrap,
          tabSize,
          insertSpaces,
          lineNumbers,
          minimap,
          bracketPairColorization,
          indentationGuides,
          renderWhitespace,
          autoClosing,
          cursorStyle,
          quickSuggestions,
          renderLineHighlight,
          folding,
          stickyScroll,
        ]) => {
          return {
            fontSize,
            wordWrap: wordWrap ? "on" : "off",
            tabSize,
            insertSpaces,
            lineNumbers,
            minimap: { enabled: minimap },
            "bracketPairColorization.enabled": bracketPairColorization,
            guides: { indentation: indentationGuides },
            renderWhitespace,
            autoClosingBrackets: autoClosing ? "languageDefined" : "never",
            autoClosingQuotes: autoClosing ? "languageDefined" : "never",
            cursorStyle,
            // Desativadas, as sugestões ainda aparecem com Ctrl + Espaço.
            quickSuggestions,
            suggestOnTriggerCharacters: quickSuggestions,
            renderLineHighlight,
            folding,
            stickyScroll: { enabled: stickyScroll },
          };
        },
      ),
    );
  }

  /**
   * Um nível de indentação, do jeito que o editor está configurado agora.
   */
  editorIndentation() {
    return this.get(settings.editorInsertSpaces) ? " ".repeat(this.get(settings.editorTabSize)) : "\t";
  }
}
