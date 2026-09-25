import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import type { IPortugolCodeDiagnostic } from "@portugol-webstudio/antlr";
import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { PortugolExecutor, PortugolMessage, PortugolWebWorkersRunner } from "@portugol-webstudio/runner";
import { captureException, setExtra } from "@sentry/angular";
import { saveAs } from "file-saver";
import { encode } from "iconv-lite";
import { ShortcutInput } from "ng-keyboard-shortcuts";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription, combineLatest, debounceTime, fromEventPattern, mergeMap } from "rxjs";
import { GraphicsRenderer, IGraphicsRendererComponent } from "../../renderer";
import { IExtendedWindowApi } from "../../types";
import { DialogRendererComponent } from "../dialog-renderer/dialog-renderer.component";
import { FileService } from "../file.service";
import { settings } from "../../settings";
import { SettingsService } from "../settings.service";
import { ShareService } from "../share.service";
import { ThemeService } from "../theme.service";
import { WorkerService } from "../worker.service";
import { WorkspaceService } from "../workspace.service";

@Component({
  selector: "app-tab-editor",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./tab-editor.component.html",
  styleUrl: "./tab-editor.component.scss",
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TabEditorComponent implements OnInit, OnDestroy {
  private gaService = inject(GoogleAnalyticsService);
  private snack = inject(MatSnackBar);
  private worker = inject(WorkerService);
  private fileService = inject(FileService);
  private shareService = inject(ShareService);
  private themeService = inject(ThemeService);
  private settingsService = inject(SettingsService);
  private dialog = inject(MatDialog);
  private workspace = inject(WorkspaceService);

  private _code$?: Subscription;
  private _stdOut$?: Subscription;
  private _events$?: Subscription;
  private _theme$?: Subscription;
  private _settings$?: Subscription;

  /**
   * A aba que este editor mostra; o conteúdo dela vive no estado da aplicação.
   */
  readonly tabId = input.required<string>();

  private readonly title = computed(() => this.workspace.titleOf(this.tabId()));

  /**
   * Cópia local do código, que é o que o Monaco edita. O estado é a fonte da
   * verdade, mas reenviar cada tecla de volta para o editor recriaria o
   * conteúdo e jogaria o cursor para o início, então só escrevemos para fora.
   */
  code = "";

  readonly help = output();
  readonly settings = output();

  readonly shareSnackTemplate = viewChild.required<TemplateRef<{ data: { url: string } }>>("shareSnackTemplate");
  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>("fileInput");

  transpiling = false;
  executor = new PortugolExecutor(PortugolWebWorkersRunner);

  graphicsRenderer = new GraphicsRenderer(this.executor);
  graphicsRendererModal: MatDialogRef<DialogRendererComponent> | null = null;

  codeEditor?: monaco.editor.IStandaloneCodeEditor;

  // As cores dos pares são uma opção do modelo de texto, e o Monaco só repassa
  // ao modelo as chaves registradas na configuração: `bracketPairColorization`
  // não é uma delas, só `bracketPairColorization.enabled`.
  codeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions & {
    "bracketPairColorization.enabled"?: boolean;
  } = {
    theme: "portugol-dark",
    language: "portugol",
    tabCompletion: "on",
    // Com a detecção, um arquivo já indentado ignoraria o tamanho da tabulação
    // escolhido nas configurações.
    detectIndentation: false,
  };

  stdOutEditor?: monaco.editor.IStandaloneCodeEditor;

  outputAutoScroll = true;

  stdOutEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol-dark",
    lineNumbers: "off",
    readOnly: true,
    minimap: { enabled: false },
    wordWrap: "on",
    language: "plaintext",
    // Sem `tabSize`: no Monaco ele vale para todos os editores da página, e um
    // valor aqui sobrescreveria o das configurações no editor de código.
    guides: { indentation: false },
  };

  generatedCodeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    ...this.stdOutEditorOptions,
    language: "swift",
    guides: { indentation: true },
  };

  sharing = false;

  hasSaveFilePickerSupport = "showSaveFilePicker" in window;

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
        this.fileInput().nativeElement.click();
      },
    },
    {
      key: "ctrl + enter",
      preventDefault: true,
      command: this.runCode.bind(this),
    },
  ];

  ngOnInit() {
    // O estado já entrega a aba pronta, inclusive o esqueleto de um programa novo.
    this.code = this.workspace.contentsOf(this.tabId());

    this._stdOut$ = this.executor.stdOut$.subscribe(() => {
      if (this.outputAutoScroll) {
        this.stdOutEditorCursorEnd();
      }
    });

    // Mesmo sem rolar sozinha, a saída vai para o fim quando o programa espera
    // uma entrada: é com o foco nela que o que se digita chega ao `leia`.
    this._stdOut$.add(
      this.executor.waitingForInput$.subscribe(waiting => {
        if (waiting) {
          this.stdOutEditorCursorEnd();
        }
      }),
    );

    this._events$ = this.executor.events.subscribe({
      next: event => {
        switch (event.type) {
          case "finish": {
            const rendererModal = this.graphicsRendererModal;

            if (rendererModal) {
              this.graphicsRendererModal = null;
              rendererModal.close();
            }

            break;
          }

          case "error": {
            this.gaService.event("execution_error", "Execução", "Erro em execução de código");
            break;
          }

          case "message": {
            this.handlePortugolMessage(event.message).catch(console.error);
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
      this.settingsService.observe(settings.editorFontSize),
      this.settingsService.observe(settings.editorWordWrap),
      this.settingsService.observe(settings.editorTabSize),
      this.settingsService.observe(settings.editorInsertSpaces),
      this.settingsService.observe(settings.editorLineNumbers),
      this.settingsService.observe(settings.editorMinimap),
      this.settingsService.observe(settings.editorBracketPairColorization),
      this.settingsService.observe(settings.editorIndentationGuides),
      this.settingsService.observe(settings.editorRenderWhitespace),
      this.settingsService.observe(settings.editorAutoClosing),
      this.settingsService.observe(settings.editorCursorStyle),
    ]).subscribe(
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
      ]) => {
        this.codeEditorOptions = {
          ...this.codeEditorOptions,
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
        };

        this.generatedCodeEditorOptions = {
          ...this.generatedCodeEditorOptions,
          fontSize,
          wordWrap: wordWrap ? "on" : "off",
        };
      },
    );

    // A saída sempre quebra as linhas: a configuração de quebra de linha é só
    // do editor de código.
    this._settings$.add(
      this.settingsService.outputFontSize().subscribe(fontSize => {
        this.stdOutEditorOptions = { ...this.stdOutEditorOptions, fontSize };
      }),
    );

    this._settings$.add(
      this.settingsService.observe(settings.outputClearOnRun).subscribe(clear => {
        this.executor.clearStdOutOnRun = clear;
      }),
    );

    this._settings$.add(
      this.settingsService.observe(settings.outputAutoScroll).subscribe(autoScroll => {
        this.outputAutoScroll = autoScroll;
      }),
    );

    this.graphicsRenderer.addEventListener("create", event => {
      const component = this.openRendererModal();

      if (component) {
        event.component = component;
      }
    });
  }

  ngOnDestroy() {
    this.executor.stop();
    this.worker.abortTranspilation();
    this._code$?.unsubscribe();
    this._events$?.unsubscribe();
    this._stdOut$?.unsubscribe();
    this._theme$?.unsubscribe();
    this._settings$?.unsubscribe();
  }

  async runCode() {
    this.gaService.event("editor_start_execution", "Editor", "Botão de Iniciar Execução");
    setExtra("code", this.code);

    this.transpiling = true;

    let result;

    try {
      result = await this.worker.transpileCode(this.code);
    } catch (error) {
      captureException(error, {
        tags: { transpile: true },
        extra: { code: this.code },
      });

      alert(
        "Ocorreu um erro ao transpilar o código, possivelmente o seu navegador não suporta Web Workers. Por favor, tente novamente em outro navegador. Caso o erro persista, acesse https://github.com/dgadelha/Portugol-Webstudio/issues/new/choose",
      );

      alert(error);
    } finally {
      this.transpiling = false;
    }

    if (result) {
      // A checagem ao vivo é debounced: quem edita e roda em menos de 500ms veria as marcas
      // do código anterior. Estas vêm do mesmo `checkCode` que decidiu se ia executar.
      this.setEditorDiagnostics(result.diagnostics.concat(result.parseErrors));
      this.executor.runTranspiled(result);
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

  async handlePortugolMessage(message: PortugolMessage) {
    if (message.type.startsWith("graphics.")) {
      await this.graphicsRenderer.handleRendererMessage(message);
    }
  }

  openRendererModal(): IGraphicsRendererComponent | null {
    this.gaService.event("editor_open_renderer", "Editor", "Abrir modal de renderização");
    this.graphicsRendererModal = this.dialog.open(DialogRendererComponent, {
      hasBackdrop: false,
      panelClass: "portugol-renderer-dialog",
    });

    this.graphicsRendererModal.afterClosed().subscribe(() => {
      this.graphicsRenderer.destroy();

      if (this.graphicsRendererModal !== null) {
        this.graphicsRendererModal = null;
        this.stopCode();
      }
    });

    return this.graphicsRendererModal.componentInstance;
  }

  async openFile(event: Event) {
    this.gaService.event("editor_open_file", "Editor", "Botão de Abrir arquivo");
    const { files } = event.target as HTMLInputElement;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const contents = await this.fileService.getContents(file);

    this.workspace.renameTab(this.tabId(), file.name);
    this.onCodeChange(contents);
  }

  onCodeChange(contents: string) {
    this.code = contents;
    this.workspace.setContents(this.tabId(), contents);
  }

  private prepareFile(as: "text" | "binary", compat = false) {
    const blob = (() => {
      if (compat) {
        return new Blob([Uint8Array.from(encode(this.code, "ISO-8859-1"))], {
          type: `${as === "binary" ? "application/octet-stream" : "text/plain"}; charset=ISO-8859-1`,
        });
      }

      return new Blob([this.code], {
        type: as === "binary" ? "application/octet-stream" : "text/plain",
      });
    })();

    let fileName = this.title();

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

    if (!extendedWindowApi.showSaveFilePicker) {
      return;
    }

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
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

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
        this.fileInput().nativeElement.click();
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
        mergeMap(async () => this.worker.checkCode(this.code)),
      )
      .subscribe({
        next: result => {
          this.setEditorDiagnostics(result.diagnostics.concat(result.parseErrors));
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
      this.snack.openFromTemplate(this.shareSnackTemplate(), {
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

  setEditorDiagnostics(diagnostics: IPortugolCodeDiagnostic[]) {
    const model = this.codeEditor?.getModel();

    if (model) {
      const severityMap: Record<PortugolDiagnosticSeverity, monaco.MarkerSeverity> = {
        [PortugolDiagnosticSeverity.Error]: monaco.MarkerSeverity.Error,
        [PortugolDiagnosticSeverity.Warning]: monaco.MarkerSeverity.Warning,
        [PortugolDiagnosticSeverity.Information]: monaco.MarkerSeverity.Info,
      };

      monaco.editor.setModelMarkers(
        model,
        "owner",
        diagnostics.map(error => {
          return {
            startLineNumber: error.startLine,
            startColumn: error.startCol + 1,
            endLineNumber: error.endLine,
            endColumn: error.endCol + 2,
            message: error.message,
            severity: severityMap[error.severity] ?? monaco.MarkerSeverity.Error,
          };
        }),
      );
    }
  }
}
