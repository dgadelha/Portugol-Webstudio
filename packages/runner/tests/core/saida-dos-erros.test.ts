import { of, Subject } from "rxjs";
import { describe, expect, test } from "vitest";

import { IPortugolRunner, PortugolEvent, PortugolExecutor, PortugolWorkerThreadsRunner, transpile } from "../../src";
import { portugol } from "../helpers/code";

/**
 * A saída do executor depois que o programa termina.
 */
function output(executor: PortugolExecutor, run: () => void) {
  return new Promise<string>(resolve => {
    executor.events.subscribe(event => {
      if (event.type === "finish") {
        resolve(executor.stdOut);
      }
    });

    run();
  });
}

/**
 * Um runner que só devolve um erro sem posição, como um erro antes do primeiro comando.
 */
class ErrorWithoutPositionRunner {
  stdOut$ = new Subject<string>();
  waitingForInput$ = new Subject<boolean>();
  running$ = new Subject<boolean>();
  byteCode = "";

  run() {
    return of<PortugolEvent[]>(
      { type: "error", error: new Error("Foi efetuada uma divisão por zero.") },
      { type: "finish", stopped: false, time: 0 },
    );
  }
}

/**
 * Como no Portugol Studio, o erro de execução vem depois de "Ocorreu um erro durante a
 * execução do programa:", com a linha e a coluna numa linha à parte.
 */
describe("Saída dos erros de execução", () => {
  test("Mostra a mensagem e a posição do erro", async () => {
    const executor = new PortugolExecutor(PortugolWorkerThreadsRunner);

    executor.showExecutionTime = false;

    const code = portugol`
      programa {
        funcao inicio() {
          inteiro zero = 0
          escreva(1 / zero)
        }
      }
    `;

    await expect(
      output(executor, () => {
        executor.runTranspiled(transpile(code));
      }),
    ).resolves.toBe(
      "\n⛔ Ocorreu um erro durante a execução do programa: Foi efetuada uma divisão por zero.\n" +
        "Linha: 4, Coluna: 5\n" +
        "\nPrograma finalizado.\n",
    );
  });

  test("Sem a posição, mostra só a mensagem", async () => {
    const executor = new PortugolExecutor(ErrorWithoutPositionRunner as unknown as typeof IPortugolRunner);

    executor.showExecutionTime = false;

    // O runner de mentira ignora o programa, que só precisa não ter erros de compilação
    const code = "programa { funcao inicio() { } }";

    await expect(
      output(executor, () => {
        executor.runTranspiled(transpile(code));
      }),
    ).resolves.toBe(
      "\n⛔ Ocorreu um erro durante a execução do programa: Foi efetuada uma divisão por zero.\n" +
        "\nPrograma finalizado.\n",
    );
  });
});
