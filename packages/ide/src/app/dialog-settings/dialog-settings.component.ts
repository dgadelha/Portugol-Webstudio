import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AngularSvgIconModule } from "angular-svg-icon";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { LocalStorage, LocalStorageService } from "ngx-webstorage";
import { debounceTime, filter, map, merge } from "rxjs";
import {
  EditorCursorStyle,
  EditorLineNumbers,
  EditorRenderWhitespace,
  settings,
  ThemePreference,
} from "../../settings";

@Component({
  selector: "app-dialog-settings",
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatRadioModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatInputModule,
    AngularSvgIconModule,
  ],
  standalone: true,
  templateUrl: "./dialog-settings.component.html",
  styleUrl: "./dialog-settings.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class DialogSettingsComponent {
  private localStorageService = inject(LocalStorageService);
  private gaService = inject(GoogleAnalyticsService);

  protected readonly settings = settings;

  @LocalStorage(settings.theme.key, settings.theme.default)
  theme!: ThemePreference;

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

  @LocalStorage(settings.outputFontSize.key)
  private storedOutputFontSize?: number;

  /**
   * Até ser alterado, acompanha o tamanho da fonte do editor.
   */
  get outputFontSize() {
    return this.storedOutputFontSize ?? this.editorFontSize;
  }

  set outputFontSize(value: number) {
    this.storedOutputFontSize = value;
  }

  @LocalStorage(settings.outputClearOnRun.key, settings.outputClearOnRun.default)
  outputClearOnRun!: boolean;

  @LocalStorage(settings.outputAutoScroll.key, settings.outputAutoScroll.default)
  outputAutoScroll!: boolean;

  constructor() {
    // Uma espera por configuração, para o controle deslizante não registrar
    // cada passo do arraste. O `takeUntilDestroyed` vem antes do
    // `debounceTime` para que uma mudança feita logo antes de fechar o diálogo
    // ainda seja registrada.
    merge(
      ...Object.values(settings).map(({ key }) =>
        this.localStorageService.observe(key).pipe(
          takeUntilDestroyed(),
          // "Restaurar padrões" apaga as chaves e é registrado à parte.
          filter(value => value !== null && value !== undefined),
          debounceTime(1000),
          map(value => `${key}=${String(value)}`),
        ),
      ),
    ).subscribe(label => {
      this.gaService.event("settings_change", "Configurações", label);
    });
  }

  resetDefaults() {
    this.gaService.event("settings_reset", "Configurações", "Restaurar padrões");

    // `clear()` do ngx-webstorage apaga o `localStorage` inteiro, inclusive o
    // código que o usuário está editando: aqui só as configurações voltam ao
    // padrão.
    for (const { key } of Object.values(settings)) {
      this.localStorageService.clear(key);
    }
  }
}
