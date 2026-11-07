import { inject, Service } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { combineLatest, defer, distinctUntilChanged, map, Observable, shareReplay, startWith } from "rxjs";
import { isMacintosh, Setting, settings } from "../settings";

/**
 * O nome de um editor para o leitor de tela. Com o modo para leitores de tela desligado, ele
 * diz o atalho que liga o modo (`MonacoService.addScreenReaderToggle`), como no VS Code.
 */
export function editorAriaLabel(
  name: string,
  accessibilitySupport: monaco.editor.IEditorOptions["accessibilitySupport"],
): string {
  if (accessibilitySupport === "on") {
    return name;
  }

  const shortcut = isMacintosh ? "Shift + Option + F1" : "Shift + Alt + F1";

  return `${name}. Para otimizar o editor para leitores de tela, aperte ${shortcut}`;
}

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
   * Só o modo para leitores de tela das opções do editor, para os editores que não seguem as
   * outras configurações (a saída, a prévia dos exemplos).
   */
  accessibilitySupport() {
    return this.editorOptions$.pipe(
      map(options => options.accessibilitySupport),
      distinctUntilChanged(),
    );
  }

  /**
   * Um só fluxo para todas as abas e a prévia das configurações: cada uma
   * observaria as 16 chaves do armazenamento por conta própria.
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
      this.observe(settings.editorAccessibilitySupport),
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
          accessibilitySupport,
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
            // As palavras soltas dos arquivos abertos: as sugestões já vêm do que o programa
            // declarou. Os tipos do ngx-monaco-editor dizem `boolean`, mas o Monaco só desliga
            // com "off": o `false` vira "off" nas opções do editor, mas não na configuração de
            // onde o `editorWorkerService` lê esta opção.
            wordBasedSuggestions: "off" as unknown as boolean,
            renderLineHighlight,
            folding,
            stickyScroll: { enabled: stickyScroll },
            // Desligado, fica no "auto", que no navegador age como sem leitor de tela. O "off" seria
            // pior: o Monaco deixaria de passar o código ao leitor também no Firefox, e o nome do
            // editor viraria "O editor não está acessível no momento".
            accessibilitySupport: accessibilitySupport ? ("on" as const) : ("auto" as const),
            // A informação aparece 200 ms depois que o mouse para, e não nos 300 do Monaco. Com
            // o mouse andando pelo código, ela continua sem aparecer.
            hover: { delay: 200 },
            // No nome de uma declaração, a definição é ele mesmo: o Monaco procuraria as
            // referências, que o editor ainda não tem, e diria em inglês que não há nenhuma.
            gotoLocation: { alternativeDefinitionCommand: "" },
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
