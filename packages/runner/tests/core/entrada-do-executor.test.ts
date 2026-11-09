import { Subject } from "rxjs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { IPortugolRunner, PortugolEvent, PortugolExecutor, transpile } from "../../src";

/**
 * Um runner que só pede entradas quando o teste manda (`ask`) e guarda o que cada leia recebeu.
 * Como os runners de verdade, ele avisa o fim da espera assim que recebe a linha.
 */
class InputRunner {
  static last: InputRunner;

  stdOut$ = new Subject<string>();
  waitingForInput$ = new Subject<boolean>();
  running$ = new Subject<boolean>();
  stdIn = new Subject<string>();
  byteCode = "";

  /**
   * O que cada leia recebeu, na ordem.
   */
  reads: string[] = [];

  private waiting = false;
  private events = new Subject<PortugolEvent>();

  constructor() {
    InputRunner.last = this;

    this.stdIn.subscribe(content => {
      if (!this.waiting) {
        return;
      }

      this.waiting = false;
      this.waitingForInput$.next(false);
      this.reads.push(content);
    });
  }

  run() {
    return this.events;
  }

  /**
   * O programa chega a um leia.
   */
  ask() {
    this.waiting = true;
    this.waitingForInput$.next(true);
  }

  finish(stopped = false) {
    this.waiting = false;
    this.events.next({ type: "finish", stopped, time: 0 });
  }

  destroy(stopped = false) {
    this.finish(stopped);
  }
}

const code = "programa { funcao inicio() { } }";

describe("Entrada do executor", () => {
  let executor: PortugolExecutor;
  let signals: boolean[];

  /**
   * Começa uma execução e devolve o runner dela.
   */
  function run() {
    executor.runTranspiled(transpile(code));

    return InputRunner.last;
  }

  beforeEach(() => {
    executor = new PortugolExecutor(InputRunner as unknown as typeof IPortugolRunner);
    executor.showExecutionTime = false;
    signals = [];
    executor.waitingForInput$.subscribe(waiting => {
      signals.push(waiting);
    });
  });

  test("Um colar com várias linhas responde os leia seguintes, na ordem", () => {
    const runner = run();

    runner.ask();
    executor.sendInput("3\n4\n");

    expect(runner.reads).toEqual(["3"]);

    runner.ask();

    expect(runner.reads).toEqual(["3", "4"]);
    expect(executor.stdOut).toBe("3\n4\n");
    // O segundo leia, respondido pela fila, não chega a ser avisado como espera
    expect(signals).toEqual([true, false]);
    expect(executor.waitingForInput).toBe(false);
  });

  test("Uma linha sem Enter no fim fica no leia seguinte, que continua esperando", () => {
    const runner = run();

    runner.ask();
    executor.sendInput("1\n2");
    runner.ask();

    expect(runner.reads).toEqual(["1"]);
    expect(executor.stdInBuffer).toBe("2");
    expect(executor.waitingForInput).toBe(true);
    expect(signals).toEqual([true, false, true]);

    executor.sendInput("\n");

    expect(runner.reads).toEqual(["1", "2"]);
  });

  test("Sem um leia esperando, o texto não vai a lugar nenhum", () => {
    const runner = run();

    executor.sendInput("5\n");
    executor.stdIn.next("6");
    runner.ask();

    expect(runner.reads).toEqual([]);
    expect(executor.stdOut).toBe("");
    expect(executor.waitingForInput).toBe(true);
  });

  test("O stdIn faz o mesmo que o sendInput", () => {
    const runner = run();

    runner.ask();
    executor.stdIn.next("7\n8\n");
    runner.ask();

    expect(runner.reads).toEqual(["7", "8"]);
  });

  test("Cada envio é separado: o que se digita depois do Enter, sem leia esperando, se perde", () => {
    const runner = run();

    runner.ask();

    for (const char of "7\r8\r") {
      executor.stdIn.next(char);
    }

    runner.ask();

    expect(runner.reads).toEqual(["7"]);
    expect(executor.waitingForInput).toBe(true);
  });

  test.each([
    ["um emoji composto", "a👨‍👩‍👧"],
    ["uma bandeira", "a🇧🇷"],
    ["um emoji com tom de pele", "a👍🏽"],
    ["uma letra com acento combinado", "aé"],
  ])("O Backspace apaga %s inteiro", (_, text) => {
    const runner = run();

    runner.ask();
    executor.sendInput(text);
    executor.sendInput("\b");
    executor.sendInput("\n");

    expect(runner.reads).toEqual(["a"]);
    expect(executor.stdOut).toBe("a\n");
  });

  test("Parar com um leia esperando avisa o fim da espera e descarta o que foi digitado", () => {
    const runner = run();

    runner.ask();
    executor.sendInput("9");
    executor.stop();

    expect(signals).toEqual([true, false]);
    expect(executor.waitingForInput).toBe(false);
    expect(executor.stdInBuffer).toBe("");
  });

  test("Parar descarta o resto de um colar", () => {
    const first = run();

    first.ask();
    executor.sendInput("1\n2\n");
    executor.stop();

    const second = run();

    second.ask();

    expect(first.reads).toEqual(["1"]);
    expect(second.reads).toEqual([]);
    expect(executor.waitingForInput).toBe(true);
  });

  test("Com o resto de um colar na fila, um envio novo vai para trás dele", () => {
    const runner = run();

    runner.ask();
    executor.sendInput("1\n2");
    executor.sendInput("3\n");
    runner.ask();

    expect(runner.reads).toEqual(["1", "23"]);
  });

  test("O fim do programa descarta o resto de um colar", () => {
    const runner = run();

    runner.ask();
    executor.sendInput("1\n2\n3\n");
    runner.finish();
    // Um leia que nenhum programa de verdade faria depois do fim
    runner.ask();

    expect(runner.reads).toEqual(["1"]);
  });
});

/**
 * Sem o `Intl.Segmenter` (Firefox antes do 125), o Backspace apaga um ponto de código: um emoji
 * simples sai inteiro, sem deixar metade dele na string.
 */
describe("Entrada do executor sem o Intl.Segmenter", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Intl",
      new Proxy(Intl, {
        has: (target, key) => key !== "Segmenter" && Reflect.has(target, key),
        get: (target, key): unknown => (key === "Segmenter" ? undefined : Reflect.get(target, key)),
      }),
    );
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  test("O Backspace apaga um emoji simples inteiro", async () => {
    const src = await import("../../src");
    const executor = new src.PortugolExecutor(InputRunner as unknown as typeof IPortugolRunner);

    executor.runTranspiled(src.transpile(code));

    const runner = InputRunner.last;

    runner.ask();
    executor.sendInput("a😀");
    executor.sendInput("\b");
    executor.sendInput("\n");

    expect(runner.reads).toEqual(["a"]);
  });
});
