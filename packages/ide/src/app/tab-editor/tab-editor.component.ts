import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  inject,
} from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import type { PortugolCodeError } from "@portugol-webstudio/antlr";
import { PortugolExecutor, PortugolWebWorkersRunner } from "@portugol-webstudio/runner";
import { captureException, setExtra } from "@sentry/angular";
import { saveAs } from "file-saver";
import { encode } from "iconv-lite";
import { ShortcutInput } from "ng-keyboard-shortcuts";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription, combineLatest, debounceTime, fromEventPattern, mergeMap } from "rxjs";
import { FileService } from "../file.service";
import { SettingsService } from "../settings.service";
import { ShareService } from "../share.service";
import { ThemeService } from "../theme.service";
import { WorkerService } from "../worker.service";

interface IExtendedWindowApi extends Window {
  showSaveFilePicker?: (options: {
    types: Array<{ description: string; accept: Record<string, string[]> }>;
    excludeAcceptAllOption?: boolean;
    suggestedName?: string;
  }) => Promise<FileSystemFileHandle>;
}

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Component({
  standalone: false,
  selector: "app-tab-editor",
  templateUrl: "./tab-editor.component.html",
  styleUrls: ["./tab-editor.component.scss"],
})
export class TabEditorComponent implements OnInit, OnDestroy {
  private _code$?: Subscription;
  private _stdOut$?: Subscription;
  private _events$?: Subscription;
  private _theme$?: Subscription;
  private _settings$?: Subscription;

  private gaService = inject(GoogleAnalyticsService);
  private snack = inject(MatSnackBar);
  private worker = inject(WorkerService);
  private fileService = inject(FileService);
  private shareService = inject(ShareService);
  private themeService = inject(ThemeService);
  private settingsService = inject(SettingsService);

  @Input()
  title?: string;

  @Input()
  code?: string;

  @Output() titleChange = new EventEmitter<string>();
  @Output() help = new EventEmitter();
  @Output() settings = new EventEmitter();

  @ViewChild("fileInput")
  fileInput!: ElementRef<HTMLInputElement>;

  transpiling = false;
  executor = new PortugolExecutor(PortugolWebWorkersRunner);

  codeEditor?: monaco.editor.IStandaloneCodeEditor;

  codeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol-dark",
    language: "portugol",
    tabCompletion: "on",
    tabSize: 2,
  };

  stdOutEditor?: monaco.editor.IStandaloneCodeEditor;

  stdOutEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol-dark",
    lineNumbers: "off",
    readOnly: true,
    minimap: { enabled: false },
    wordWrap: "on",
    language: "plaintext",
    tabSize: 2,
  };

  generatedCodeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    ...this.stdOutEditorOptions,
    language: "javascript",
  };

  sharing = false;
  hasSaveFilePickerSupport = false;

  shortcuts: ShortcutInput[] = [
    {
      key: "f1",
      preventDefault: true,
      command: this.openHelp.bind(this),
    },
    {
      key: "ctrl + s",
      preventDefault: true,
      command: () => {
        this.saveFile();
      },
    },
    {
      key: "ctrl + o",
      preventDefault: true,
      command: () => {
        this.fileInput.nativeElement.click();
      },
    },
    {
      key: "ctrl + enter",
      preventDefault: true,
      command: this.runCode.bind(this),
    },
  ];

  @ViewChild("shareSnackTemplate", { read: TemplateRef })
  shareSnackTemplate!: TemplateRef<{ data: { url: string } }>;

  ngOnInit() {
    this.code ||= `programa {\n  funcao inicio() {\n    \n  }\n}\n`;

    this._stdOut$ = this.executor.stdOut$.subscribe(() => {
      this.stdOutEditorCursorEnd();
    });

    this._events$ = this.executor.events.subscribe({
      next: event => {
        switch (event.type) {
          case "error": {
            this.gaService.event("execution_error", "Execução", "Erro em execução de código");
            break;
          }

          case "parseError": {
            this.setEditorErrors(event.errors);
            break;
          }

          default: {
            break;
          }
        }
      },

      error: error => {
        this.gaService.event("execution_runner_error", "Execução", "Erro ao carregar o runner para rodar o código");

        captureException(error, { extra: { code: this.code } });
      },
    });

    this._theme$ = this.themeService.theme$.subscribe(theme => {
      this.codeEditorOptions = { ...this.codeEditorOptions, theme: `portugol-${theme}` };
      this.stdOutEditorOptions = { ...this.stdOutEditorOptions, theme: `portugol-${theme}` };
      this.generatedCodeEditorOptions = { ...this.generatedCodeEditorOptions, theme: `portugol-${theme}` };
    });

    this._settings$ = combineLatest([
      this.settingsService.editorFontSize,
      this.settingsService.editorWordWrap,
    ]).subscribe(([fontSize, wordWrap]) => {
      this.codeEditorOptions = {
        ...this.codeEditorOptions,
        fontSize,
        wordWrap: wordWrap ? "on" : "off",
      };

      this.stdOutEditorOptions = {
        ...this.stdOutEditorOptions,
        fontSize,
        wordWrap: wordWrap ? "on" : "off",
      };

      this.generatedCodeEditorOptions = {
        ...this.generatedCodeEditorOptions,
        fontSize,
        wordWrap: wordWrap ? "on" : "off",
      };
    });

    this.hasSaveFilePickerSupport = "showSaveFilePicker" in window;
  }

  ngOnDestroy() {
    this._code$?.unsubscribe();
    this._events$?.unsubscribe();
    this._stdOut$?.unsubscribe();
    this._theme$?.unsubscribe();
    this._settings$?.unsubscribe();
    this.executor.stop();
  }

  async runCode() {
    this.gaService.event("editor_start_execution", "Editor", "Botão de Iniciar Execução");
    setExtra("code", this.code);

    this.transpiling = true;

    const code = this.code ?? "";
    let result;

    try {
      result = await this.worker.transpileCode(code);
    } catch (error) {
      captureException(error, { tags: { transpile: true }, extra: { code } });

      alert(
        "Ocorreu um erro ao transpilar o código, possivelmente o seu navegador não suporta Web Workers. Por favor, tente novamente em outro navegador. Caso o erro persista, acesse https://github.com/dgadelha/Portugol-Webstudio/issues/new/choose",
      );

      alert(error);
    } finally {
      this.transpiling = false;
    }

    if (result) {
      this.setEditorErrors([]);
      this.executor.runTranspiled({ ...result, code });
    }
  }

  stopCode() {
    this.gaService.event("editor_stop_execution", "Editor", "Botão de Parar Execução");
    this.executor.stop();

    if (this.transpiling) {
      this.worker.abortTranspilation();
      this.transpiling = false;
    }

    this.stdOutEditorCursorEnd();
  }

  async openFile(event: Event) {
    this.gaService.event("editor_open_file", "Editor", "Botão de Abrir arquivo");
    const { files } = event.target as HTMLInputElement;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const contents = await this.fileService.getContents(file);

    this.title = file.name;
    this.titleChange.emit(file.name);
    this.code = contents?.toString();
  }

  private prepareFile(as: "text" | "binary", compat = false) {
    const blob = (() => {
      if (compat) {
        return new Blob([encode(this.code ?? "", "ISO-8859-1")], {
          type: `${as === "binary" ? "application/octet-stream" : "text/plain"}; charset=ISO-8859-1`,
        });
      }

      return new Blob([this.code ?? ""], {
        type: as === "binary" ? "application/octet-stream" : "text/plain",
      });
    })();

    let fileName = this.title || "Sem título";

    if (!fileName.endsWith(".por")) {
      fileName += ".por";
    }

    return { blob, fileName };
  }

  saveFile(compat = false) {
    const { blob, fileName } = this.prepareFile("binary", compat);

    saveAs(blob, fileName, { autoBom: false });
  }

  saveFileManual(as: "text" | "binary") {
    const { blob, fileName } = this.prepareFile(as);
    const file = new File([blob], fileName, { type: blob.type });

    window.open(URL.createObjectURL(file), "_blank");
  }

  async saveFileWithPicker() {
    const extendedWindowApi = window as IExtendedWindowApi;
    if (!extendedWindowApi.showSaveFilePicker) return;

    const { blob, fileName } = this.prepareFile("binary");

    try {
      const fileHandle = await extendedWindowApi.showSaveFilePicker({
        types: [
          {
            description: "Arquivo Portugol",
            accept: {
              "application/octet-stream": [".por"],
            },
          },
        ],
        excludeAcceptAllOption: true,
        suggestedName: fileName,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      this.snack.open("Arquivo salvo com sucesso!", "OK", {
        duration: 3000,
      });
    } catch (error) {
      console.error(error);

      this.snack.open("Ocorreu um erro ao salvar o arquivo!", "OK", {
        duration: 3000,
      });
    }
  }

  onStdOutEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.initShortcuts(editor);
    this.stdOutEditor = editor;

    editor.onKeyDown(e => {
      if (!this.executor.waitingForInput) {
        return;
      }

      if (e.code === "Enter" || e.browserEvent.key === "Enter") {
        this.executor.stdIn.next("\r");
      } else if (e.code === "Backspace") {
        this.executor.stdIn.next("\b");
      } else if (e.browserEvent.key.length === 1) {
        this.executor.stdIn.next(e.browserEvent.key);
      }
    });
  }

  stdOutEditorCursorEnd() {
    if (!this.stdOutEditor) {
      return;
    }

    const editor = this.stdOutEditor;
    const model = editor.getModel();

    if (model) {
      // TODO: Find a better way to do this
      setTimeout(() => {
        editor.setPosition({
          lineNumber: model.getLineCount(),
          column: model.getLineMaxColumn(model.getLineCount()),
        });

        editor.setScrollPosition({
          scrollLeft: 0,
          scrollTop: editor.getScrollHeight(),
        });
      }, 1);

      editor.focus();
    }
  }

  initShortcuts(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.addAction({
      id: "runCode",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      label: "Executar código",
      run: this.runCode.bind(this),
    });

    editor.addAction({
      id: "saveFile",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      label: "Salvar arquivo",
      run: () => {
        this.saveFile();
      },
    });

    editor.addAction({
      id: "openFile",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
      label: "Abrir arquivo",
      run: () => {
        this.fileInput.nativeElement.click();
      },
    });

    editor.addAction({
      id: "openHelp",
      keybindings: [monaco.KeyCode.F1],
      label: "Ajuda",
      run: this.openHelp.bind(this),
    });
  }

  onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.codeEditor = editor;
    this.initShortcuts(editor);

    this._code$?.unsubscribe();

    this._code$ = fromEventPattern(editor.onDidChangeModelContent)
      .pipe(
        debounceTime(500),
        mergeMap(async () => this.worker.checkCode(this.code ?? "")),
      )
      .subscribe({
        next: result => {
          this.setEditorErrors(result.errors);
        },
        error(err) {
          console.error(err);
        },
      });
  }

  openHelp() {
    this.gaService.event("editor_help_tab_open", "Editor", "Nova aba de ajuda através do Editor");
    this.help.emit();
  }

  openSettings() {
    this.gaService.event("editor_settings_open", "Editor", "Abrir diálogo de configurações");
    this.settings.emit();
  }

  async shareFile() {
    if (!this.code) {
      return;
    }

    this.sharing = true;

    const shareUrl = await this.shareService.share(this.code);

    if (shareUrl) {
      this.snack.openFromTemplate(this.shareSnackTemplate, {
        data: {
          url: shareUrl,
        },
      });

      this.gaService.event("share_code_success", "Editor", "Código compartilhado com sucesso");
    } else {
      this.snack.open("Ocorreu um erro ao compartilhar o arquivo. Tente novamente mais tarde.", "OK", {
        duration: 3000,
      });

      this.gaService.event("share_code_error", "Editor", "Erro ao compartilhar código");
    }

    setTimeout(() => {
      this.sharing = false;
    }, 1000);
  }

  async copyStringAndCloseSnack(url: string) {
    await navigator.clipboard.writeText(url);
    this.snack.dismiss();
  }

  setEditorErrors(errors: PortugolCodeError[]) {
    const model = this.codeEditor?.getModel();

    if (model) {
      monaco.editor.setModelMarkers(
        model,
        "owner",
        errors.map(error => {
          return {
            startLineNumber: error.startLine,
            startColumn: error.startCol + 1,
            endLineNumber: error.endLine,
            endColumn: error.endCol + 2,
            message: error.message,
            severity: monaco.MarkerSeverity.Error,
          };
        }),
      );
    }
  }
}
