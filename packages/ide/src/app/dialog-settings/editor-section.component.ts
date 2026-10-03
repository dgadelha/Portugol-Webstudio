import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MonacoEditorModule } from "@materia-ui/ngx-monaco-editor";
import { LocalStorage } from "ngx-webstorage";
import { combineLatest } from "rxjs";
import {
  EditorCursorStyle,
  EditorLineNumbers,
  EditorRenderLineHighlight,
  EditorRenderWhitespace,
  settings,
} from "../../settings";
import { SettingsService } from "../settings.service";
import { ThemeService } from "../theme.service";
import { FontSizeControlComponent } from "./font-size-control.component";

/**
 * Código da prévia, com `\t` em cada nível de indentação: ele é trocado pela
 * indentação configurada, para a prévia acompanhar a tabulação.
 */
const PREVIEW_CODE = `programa {
\tfuncao inicio() {
\t\tinteiro idade = 18

\t\tse (idade >= 18) {
\t\t\tescreva("Olá! Esta linha é comprida para mostrar como a quebra de linha funciona no editor.\\n")
\t\t}
\t}
}
`;

@Component({
  selector: "app-editor-section",
  imports: [FormsModule, MatButtonToggleModule, MatSlideToggleModule, MonacoEditorModule, FontSizeControlComponent],
  standalone: true,
  templateUrl: "./editor-section.component.html",
  styleUrls: ["./setting-field.scss", "./editor-section.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class EditorSectionComponent {
  protected readonly settings = settings;
  protected readonly tabSizes = [2, 4, 8];

  /**
   * Um editor de verdade, com as mesmas opções e o mesmo tema do editor de
   * código. Dá para digitar nele, mas o texto não é salvo.
   */
  previewOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    language: "portugol",
    theme: "portugol-dark",
    minimap: { enabled: false },
    detectIndentation: false,
    scrollBeyondLastLine: false,
    overviewRulerLanes: 0,
    automaticLayout: true,
  };

  previewCode = "";

  @LocalStorage(settings.editorFontSize.key, settings.editorFontSize.default)
  editorFontSize!: number;

  @LocalStorage(settings.editorWordWrap.key, settings.editorWordWrap.default)
  editorWordWrap!: boolean;

  @LocalStorage(settings.editorTabSize.key, settings.editorTabSize.default)
  editorTabSize!: number;

  @LocalStorage(settings.editorInsertSpaces.key, settings.editorInsertSpaces.default)
  editorInsertSpaces!: boolean;

  @LocalStorage(settings.editorLineNumbers.key, settings.editorLineNumbers.default)
  editorLineNumbers!: EditorLineNumbers;

  @LocalStorage(settings.editorMinimap.key, settings.editorMinimap.default)
  editorMinimap!: boolean;

  @LocalStorage(settings.editorBracketPairColorization.key, settings.editorBracketPairColorization.default)
  editorBracketPairColorization!: boolean;

  @LocalStorage(settings.editorIndentationGuides.key, settings.editorIndentationGuides.default)
  editorIndentationGuides!: boolean;

  @LocalStorage(settings.editorRenderWhitespace.key, settings.editorRenderWhitespace.default)
  editorRenderWhitespace!: EditorRenderWhitespace;

  @LocalStorage(settings.editorAutoClosing.key, settings.editorAutoClosing.default)
  editorAutoClosing!: boolean;

  @LocalStorage(settings.editorCursorStyle.key, settings.editorCursorStyle.default)
  editorCursorStyle!: EditorCursorStyle;

  @LocalStorage(settings.editorRenderLineHighlight.key, settings.editorRenderLineHighlight.default)
  editorRenderLineHighlight!: EditorRenderLineHighlight;

  @LocalStorage(settings.editorQuickSuggestions.key, settings.editorQuickSuggestions.default)
  editorQuickSuggestions!: boolean;

  @LocalStorage(settings.editorLiveDiagnostics.key, settings.editorLiveDiagnostics.default)
  editorLiveDiagnostics!: boolean;

  @LocalStorage(settings.editorFolding.key, settings.editorFolding.default)
  editorFolding!: boolean;

  @LocalStorage(settings.editorStickyScroll.key, settings.editorStickyScroll.default)
  editorStickyScroll!: boolean;

  constructor() {
    const settingsService = inject(SettingsService);
    let previewIndentation: string | undefined;

    combineLatest([settingsService.editorOptions(), inject(ThemeService).theme$])
      .pipe(takeUntilDestroyed())
      .subscribe(([options, theme]) => {
        const indentation = options.insertSpaces ? " ".repeat(options.tabSize ?? 2) : "\t";

        // O minimapa não cabe na prévia.
        this.previewOptions = {
          ...this.previewOptions,
          ...options,
          minimap: { enabled: false },
          theme: `portugol-${theme}`,
        };

        // Só a indentação reescreve o código: as outras opções mantêm o que a
        // pessoa digitou para experimentar.
        if (indentation !== previewIndentation) {
          previewIndentation = indentation;
          this.previewCode = PREVIEW_CODE.replaceAll("\t", indentation);
        }
      });
  }
}
