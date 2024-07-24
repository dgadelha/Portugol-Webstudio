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
} from "@angular/core";
import { Storage, ref, uploadString } from "@angular/fire/storage";
import { MatSnackBar } from "@angular/material/snack-bar";
import type { PortugolCodeError } from "@portugol-webstudio/antlr";
import { PortugolExecutor, PortugolWebWorkersRunner } from "@portugol-webstudio/runner";
import { captureException, setExtra } from "@sentry/angular";
import { saveAs } from "file-saver";
import { ShortcutInput } from "ng-keyboard-shortcuts";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription, debounceTime, fromEventPattern, mergeMap } from "rxjs";
import { TextEncoder } from "text-encoding";

import { WorkerService } from "../worker.service";

@Component({
  selector: "app-tab-editor",
  templateUrl: "./tab-editor.component.html",
  styleUrls: ["./tab-editor.component.scss"],
})
export class TabEditorComponent implements OnInit, OnDestroy {
  private _code$?: Subscription;
  private _stdOut$?: Subscription;
  private _events$?: Subscription;

  @Input()
  title?: string;

  @Input()
  code?: string;

  @Output() titleChange = new EventEmitter<string>();
  @Output() help = new EventEmitter();

  @ViewChild("fileInput")
  fileInput!: ElementRef<HTMLInputElement>;

  transpiling = false;
  executor = new PortugolExecutor(PortugolWebWorkersRunner);

  codeEditor?: monaco.editor.IStandaloneCodeEditor;

  codeEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol",
    language: "portugol",
    tabSize: 2,
  };

  stdOutEditor?: monaco.editor.IStandaloneCodeEditor;

  stdOutEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol",
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

  shortcuts: ShortcutInput[] = [
    {
      key: "f1",
      preventDefault: true,
      command: this.openHelp.bind(this),
    },
    {
      key: "ctrl + s",
      preventDefault: true,
      command: this.saveFile.bind(this),
    },
    {
      key: "ctrl + o",
      preventDefault: true,
      command: () => this.fileInput.nativeElement.click(),
    },
    {
      key: "ctrl + enter",
      preventDefault: true,
      command: this.runCode.bind(this),
    },
  ];

  @ViewChild("shareSnackTemplate", { read: TemplateRef })
  shareSnackTemplate!: TemplateRef<{ data: { url: string } }>;

  constructor(
    private gaService: GoogleAnalyticsService,
    private storage: Storage,
    private snack: MatSnackBar,
    private worker: WorkerService,
  ) {}

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
  }

  ngOnDestroy() {
    this._code$?.unsubscribe();
    this._events$?.unsubscribe();
    this._stdOut$?.unsubscribe();
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

  openFile(event: Event) {
    this.gaService.event("editor_open_file", "Editor", "Botão de Abrir arquivo");
    const { files } = event.target as HTMLInputElement;

    if (!files || files.length === 0) {
      return;
    }

    const reader = new FileReader();
    const file = files[0];

    reader.addEventListener("load", e => {
      const contents = e.target?.result;

      this.title = file.name;
      this.titleChange.emit(file.name);
      this.code = contents?.toString();
    });

    reader.readAsText(file, "ISO-8859-1");
  }

  saveFile() {
    this.gaService.event("editor_save_file", "Editor", "Botão de Salvar arquivo");

    const textEncoder = new TextEncoder("ISO-8859-1", {
      NONSTANDARD_allowLegacyEncoding: true,
    });

    const contentEncoded = textEncoder.encode(this.code);

    const blob = new Blob([contentEncoded], {
      type: "application/octet-stream; charset=ISO-8859-1",
    });

    let fileName = this.title || "Sem título";

    if (!fileName.endsWith(".por")) {
      fileName += ".por";
    }

    saveAs(blob, fileName, { autoBom: false });
  }

  onStdOutEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.initShortcuts(editor);
    this.stdOutEditor = editor;

    editor.onKeyDown(e => {
      if (!this.executor.waitingForInput) {
        return;
      }

      if (e.code === "Enter" || e.browserEvent.keyCode === 13 || e.browserEvent.key === "Enter") {
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
      run: this.saveFile.bind(this),
    });

    editor.addAction({
      id: "openFile",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO],
      label: "Abrir arquivo",
      run: () => this.fileInput.nativeElement.click(),
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

  async shareFile() {
    if (!this.code) {
      return;
    }

    this.sharing = true;

    const shareCode = (Math.random() + 1).toString(36).slice(2, 9);
    const result = await uploadString(ref(this.storage, shareCode), this.code, undefined, {
      contentType: "text/plain",
    }).catch(error => {
      console.error(error);
      return null;
    });

    if (result) {
      this.snack.openFromTemplate(this.shareSnackTemplate, {
        data: {
          url: `https://portugol.dev/#share=${shareCode}`,
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
