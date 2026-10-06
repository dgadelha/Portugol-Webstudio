import { inject, Service } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { combineLatest, defer, map, Observable, shareReplay, startWith } from "rxjs";
import { Setting, settings } from "../settings";

@Service()
export class SettingsService {
  private localStorageSvc = inject(LocalStorageService);

  /**
   * O valor atual da configuração e, depois, cada mudança.
   */
  observe<T>(setting: Setting<T>): Observable<T> {
    // O valor inicial é lido a cada inscrição, não ao criar o fluxo: o
    // `editorOptions$` compartilhado se reinscreve quando todos os editores
    // fecham e um novo abre, e deve ver as configurações de agora.
    return defer(() =>
      this.localStorageSvc.observe(setting.key).pipe(startWith(this.localStorageSvc.retrieve(setting.key))),
    ).pipe(map(value => setting.parse(value)));
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
  editorOptions() {
    return this.editorOptions$;
  }

  /**
   * Um só fluxo para todas as abas e a prévia das configurações: cada uma
   * observaria as 15 chaves do armazenamento por conta própria.
   */
  private readonly editorOptions$: Observable<monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions> =
    combineLatest([
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
            wordWrap: wordWrap ? ("on" as const) : ("off" as const),
            tabSize,
            insertSpaces,
            lineNumbers,
            minimap: { enabled: minimap },
            "bracketPairColorization.enabled": bracketPairColorization,
            guides: { indentation: indentationGuides },
            renderWhitespace,
            autoClosingBrackets: autoClosing ? ("languageDefined" as const) : ("never" as const),
            autoClosingQuotes: autoClosing ? ("languageDefined" as const) : ("never" as const),
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
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  /**
   * Um nível de indentação, do jeito que o editor está configurado agora.
   */
  editorIndentation() {
    return this.get(settings.editorInsertSpaces) ? " ".repeat(this.get(settings.editorTabSize)) : "\t";
  }
}
