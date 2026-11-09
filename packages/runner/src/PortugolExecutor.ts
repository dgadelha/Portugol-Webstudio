import { PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";
import { Subject, Subscription } from "rxjs";

import {
  DebugCommand,
  IPortugolRunner,
  RunOptions,
  PortugolEvent,
  PortugolMessage,
} from "./runners/IPortugolRunner.js";
import type { PortugolTranspiledCode } from "./transpile.js";

/**
 * Separa o texto em caracteres como a pessoa os vê: um emoji composto (👨‍👩‍👧) ou uma letra com
 * acento combinado é um só. Sem o `Intl.Segmenter` (Firefox antes do 125), fica o ponto de código.
 */
const graphemes = "Segmenter" in Intl ? new Intl.Segmenter() : undefined;

/**
 * O último caractere do texto, inteiro, para o Backspace apagar.
 */
function lastCharacter(text: string) {
  if (graphemes) {
    return [...graphemes.segment(text)].at(-1)?.segment;
  }

  // Um emoji ocupa duas posições na string
  return /.$/su.exec(text)?.[0];
}

export class PortugolExecutor {
  private _runner?: IPortugolRunner;

  constructor(private runner: typeof IPortugolRunner) {
    this.stdIn.subscribe(data => {
      this.sendInput(data);
    });
  }

  /**
   * Manda um texto para o leia como se fosse digitado: cada quebra de linha é um Enter, e um
   * `\b` apaga o último caractere. As linhas depois do Enter que encerra o leia esperam os
   * próximos, na ordem (um colar com várias linhas). Sem um leia esperando, o texto não vai a
   * lugar nenhum, como no Portugol Studio.
   */
  sendInput(text: string) {
    if (!this.waitingForInput && this.pendingInput.length === 0) {
      return;
    }

    for (const [i, line] of text.split(/\r\n|\r|\n/).entries()) {
      if (i > 0) {
        this.#send("\r");
      }

      for (const char of line) {
        this.#send(char);
      }
    }
  }

  /**
   * Um caractere, um `\b` (apaga) ou um `\r` (Enter): para o leia que espera ou, atrás do texto
   * que já espera, para a fila. O Enter encerra a espera na hora, e o que vem depois dele fica na
   * fila, mesmo que o programa só avise o fim da espera mais tarde.
   */
  #send(data: string) {
    if (this.waitingForInput && this.pendingInput.length === 0) {
      this.#input(data);
    } else {
      this.pendingInput.push(data);
    }
  }

  #input(data: string) {
    if (data === "\b") {
      const last = lastCharacter(this.stdInBuffer);

      if (last) {
        this.stdInBuffer = this.stdInBuffer.slice(0, -last.length);
        this.stdOut = this.stdOut.slice(0, -last.length);
      }
    } else if (data === "\r") {
      // A espera acaba aqui, e não quando o programa avisa (que pode ser depois): o aviso dele
      // chega com a espera já encerrada e não se repete
      const answered = this.waitingForInput;

      this.waitingForInput = false;
      this._runner?.stdIn.next(this.stdInBuffer);
      this.stdInBuffer = "";
      this.stdOut += "\n";
      this.stdOut$.next(this.stdOut);

      // Depois da quebra de linha na saída, para quem acompanha a espera já ver a linha encerrada
      if (answered) {
        this.waitingForInput$.next(false);
      }

      return;
    } else {
      this.stdInBuffer += data;
      this.stdOut += data;
    }

    this.stdOut$.next(this.stdOut);
  }

  /**
   * Manda para o leia que começou o texto que esperava, até o próximo Enter. Responde se o
   * Enter veio, encerrando o leia.
   */
  #flushPendingInput() {
    while (this.pendingInput.length > 0) {
      const data = this.pendingInput.shift()!;

      this.#input(data);

      if (data === "\r") {
        return true;
      }
    }

    return false;
  }

  byteCode = "";

  stdInBuffer = "";

  /**
   * O mesmo que o `sendInput`, que o IDE usa: fica para quem já usava o executor antes dele.
   */
  stdIn = new Subject<string>();

  /**
   * O texto que chegou enquanto o programa não esperava uma entrada (o resto de um colar), na
   * ordem em que chegou.
   */
  private pendingInput: string[] = [];

  stdOut = "";
  stdOut$ = new Subject<string>();

  /**
   * Com `false`, a saída de uma execução fica abaixo da anterior, separada por
   * uma linha em branco, em vez de começar do zero.
   */
  clearStdOutOnRun = true;
  private _stdOut$?: Subscription;

  /**
   * Com `false`, o aviso de fim da execução não diz quanto tempo ela levou.
   */
  showExecutionTime = true;

  waitingForInput = false;
  waitingForInput$ = new Subject<boolean>();
  private _waitingForInput$?: Subscription;

  running = false;
  running$ = new Subject<boolean>();
  private _running$?: Subscription;

  events = new Subject<PortugolEvent>();
  #printTimes(_times: { check: number; transpile: number; execution?: number }) {}

  runTranspiled({ js, diagnostics, parseErrors, times }: PortugolTranspiledCode, options: RunOptions = {}) {
    try {
      this.reset(this.clearStdOutOnRun);

      if (this.stdOut.length > 0) {
        this.stdOut += this.stdOut.endsWith("\n") ? "\n" : "\n\n";
      }

      /**
       * Como o Portugol Studio: código com erro de compilação não executa. Os erros vão para
       * a saída porque nem todo cliente do runner tem um editor que os mostre. Erro de
       * sintaxe vem primeiro: se o arquivo nem analisou, o resto é consequência.
       */
      const errors = [
        ...parseErrors,
        ...diagnostics.filter(diagnostic => diagnostic.severity === PortugolDiagnosticSeverity.Error),
      ];

      if (errors.length > 0) {
        const plural = errors.length > 1 ? "s" : "";

        this.stdOut += `⛔ O seu código possui ${errors.length} erro${plural} de compilação e não foi executado:\n\n`;

        // A coluna do diagnóstico começa em 0; a mostrada começa em 1, como no editor.
        this.stdOut += errors
          .map(error => `ERRO: ${error.message} (linha ${error.startLine}, coluna ${error.startCol + 1})\n`)
          .join("");

        this.stdOut$.next(this.stdOut);
        this.#printTimes(times);
        this.reset(false);
        // Todos os erros que barraram a execução, não só os sintáticos: quem ouve precisa
        // saber por que o programa não rodou.
        this.events.next({ type: "parseError", errors });

        return;
      }

      // @ts-expect-error
      this._runner = new this.runner(js);

      if (!this._runner) {
        throw new Error("Runner not found");
      }

      this.byteCode = this._runner.byteCode;

      this._stdOut$ = this._runner.stdOut$.subscribe(data => {
        this.stdOut += data;
        this.stdOut$.next(data);
      });

      this._waitingForInput$ = this._runner.waitingForInput$.subscribe(waiting => {
        // Um leia respondido pelo resto de um colar não chega a ser avisado: a interface não
        // mostra a espera (nem abre o campo da entrada) só para ela acabar em seguida
        if (waiting && this.#flushPendingInput()) {
          return;
        }

        // O fim de uma espera que o Enter já encerrou (ou que nem foi avisada)
        if (waiting === this.waitingForInput) {
          return;
        }

        this.waitingForInput = waiting;
        this.waitingForInput$.next(waiting);
      });

      this._running$ = this._runner.running$.subscribe(data => {
        this.running = data;
        this.running$.next(data);
      });

      this._runner.run(options).subscribe({
        next: event => {
          switch (event.type) {
            case "finish": {
              // O resto de um colar que nenhum leia pediu não vale para mais nada
              this.pendingInput = [];

              const message = event.stopped ? "O programa foi interrompido!" : "Programa finalizado.";
              const time = this.showExecutionTime ? ` Tempo de execução: ${event.time} milissegundos` : "";

              this.stdOut += `\n${message}${time}\n`;

              this.#printTimes({ ...times, execution: event.time });
              this.stdOut$.next(this.stdOut);
              break;
            }

            case "clear": {
              this.stdOut = "";
              this.stdOut$.next(this.stdOut);
              break;
            }

            case "error": {
              // Como no Portugol Studio: a mensagem depois do aviso do erro, e a posição numa linha
              // à parte
              const position = event.position
                ? `Linha: ${event.position.line}, Coluna: ${event.position.column}\n`
                : "";

              this.stdOut += `\n⛔ Ocorreu um erro durante a execução do programa: ${event.error.message}\n${position}`;
              this.stdOut$.next(this.stdOut);
              break;
            }

            default: {
              break;
            }
          }

          this.events.next(event);
        },

        error(error) {
          console.error(error);
        },
      });
    } catch (error) {
      console.error(error);

      this.stdOut += `\n⛔ O seu código possui um erro de compilação!\n`;
      this.stdOut$.next(this.stdOut);
      this.#printTimes(times);

      this.reset(false);
      this.events.next({ type: "parseError", errors: parseErrors });
    }
  }

  stop() {
    this.reset(false);
  }

  private reset(clearStdOut = true) {
    if (clearStdOut) {
      this.stdOut = "";
    }

    const wasWaiting = this.waitingForInput;

    this.waitingForInput = false;

    // O que foi digitado (ou colado) e não chegou ao programa não vale para a próxima execução
    this.stdInBuffer = "";
    this.pendingInput = [];

    // Antes de largar o runner: ao parar, ele ainda avisa que não está mais rodando
    this._runner?.destroy(true);

    this._stdOut$?.unsubscribe();
    this._waitingForInput$?.unsubscribe();
    this._running$?.unsubscribe();
    this.running = false;

    // Quem acompanha a espera (como as teclas da depuração) fica sabendo que ela acabou
    if (wasWaiting) {
      this.waitingForInput$.next(false);
    }
  }

  debug(command: DebugCommand) {
    this._runner?.debug(command);
  }

  postMessage(message: PortugolMessage) {
    this._runner?.postMessage(message);
  }

  replyMessage(message: PortugolMessage, result: unknown, transferable?: Transferable[]) {
    this._runner?.replyMessage(message, result, transferable);
  }
}
