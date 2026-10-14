import { PortugolCodeChecker } from "@portugol-webstudio/parser";
import { PortugolJs } from "@portugol-webstudio/runtime";
import { describe, expect, onTestFinished, test } from "vitest";

import { DebugCommand, DebugPause, PortugolWorkerThreadsRunner } from "../../src";
import { portugol } from "../helpers/code";

type Resume = Exclude<DebugCommand["type"], "breakpoints" | "pause">;

function transpile(code: string, debugSteps: boolean) {
  const { tree } = PortugolCodeChecker.checkCode(code);
  const js = new PortugolJs();

  js.debugSteps = debugSteps;

  return js.visit(tree)!;
}

/**
 * Executa o programa com a depuração e guarda cada pausa. A cada pausa, `onPause` pode
 * mandar outros comandos ao runner, e `resume` diz como continuar (por padrão, o próximo
 * passo).
 */
function debug(
  code: string,
  {
    breakpoints = [],
    resume = () => "step",
    onPause,
    inputs = [],
  }: {
    breakpoints?: number[];
    resume?: (pause: DebugPause, index: number) => Resume;
    onPause?: (runner: PortugolWorkerThreadsRunner, index: number) => void;
    inputs?: string[];
  } = {},
) {
  return new Promise<{ pauses: DebugPause[]; output: string }>((resolve, reject) => {
    const runner = new PortugolWorkerThreadsRunner(transpile(code, true));
    const pauses: DebugPause[] = [];
    let output = "";

    runner.stdOut$.subscribe(text => {
      output += text;
    });

    runner.run({ debug: { breakpoints } }).subscribe(event => {
      switch (event.type) {
        case "paused": {
          pauses.push(event.pause);
          onPause?.(runner, pauses.length - 1);
          runner.debug({ type: resume(event.pause, pauses.length - 1) });
          break;
        }

        case "stdIn": {
          runner.stdIn.next(inputs.shift() ?? "");
          break;
        }

        case "error": {
          reject(event.error);
          break;
        }

        case "finish": {
          resolve({ pauses, output });
          break;
        }
      }
    });
  });
}

const lines = (pauses: DebugPause[]) => pauses.map(pause => pause.line);

const variable = (pause: DebugPause, name: string) => pause.frames[0]?.variables.find(v => v.name === name);

describe("Depuração", () => {
  test("Sem a opção, o código gerado não chama o step", () => {
    const code = portugol`
      programa {
        funcao inicio() {
          inteiro x = 1
        }
      }
    `;

    expect(transpile(code, false)).not.toContain("runtime.step");
    expect(transpile(code, true)).toContain("runtime.step");
  });

  test("Para antes de cada comando, com as variáveis do momento", async () => {
    const { pauses, output } = await debug(portugol`
      programa {
        funcao inicio() {
          inteiro x = 1
          x = x + 1
          escreva(x)
        }
      }
    `);

    expect(lines(pauses)).toEqual([3, 4, 5]);
    expect(variable(pauses[0], "x")).toBeUndefined();
    expect(variable(pauses[1], "x")).toMatchObject({ type: "inteiro", text: "1" });
    expect(variable(pauses[2], "x")).toMatchObject({ type: "inteiro", text: "2" });
    expect(pauses[0].frames.map(frame => frame.name)).toEqual(["inicio"]);
    expect(output).toBe("2");
  });

  test("O enquanto para a cada teste da condição", async () => {
    const { pauses } = await debug(portugol`
      programa {
        funcao inicio() {
          inteiro i = 0
          enquanto (i < 2) {
            i++
          }
        }
      }
    `);

    expect(lines(pauses)).toEqual([3, 4, 5, 4, 5, 4]);
  });

  test("O para para a cada teste, com o incremento já feito", async () => {
    const { pauses } = await debug(portugol`
      programa {
        funcao inicio() {
          para (inteiro i = 0; i < 2; i++) {
            escreva(i)
          }
        }
      }
    `);

    expect(lines(pauses)).toEqual([3, 4, 3, 4, 3]);
    expect(pauses.filter(pause => pause.line === 3).map(pause => variable(pause, "i")?.text)).toEqual(["0", "1", "2"]);
  });

  test("O faca-enquanto para no faca e no teste do enquanto", async () => {
    const { pauses } = await debug(portugol`
      programa {
        funcao inicio() {
          inteiro i = 0
          faca {
            i++
          } enquanto (i < 2)
        }
      }
    `);

    expect(lines(pauses)).toEqual([3, 4, 5, 6, 5, 6]);
  });

  test("O se para na condição e só no caminho escolhido", async () => {
    const { pauses } = await debug(portugol`
      programa {
        funcao inicio() {
          inteiro x = 5
          se (x > 3) {
            escreva("maior")
          } senao {
            escreva("menor")
          }
        }
      }
    `);

    expect(lines(pauses)).toEqual([3, 4, 5]);
  });

  describe("Chamadas de função", () => {
    const code = portugol`
      programa {
        funcao inteiro dobro(inteiro n) {
          inteiro r = n * 2
          retorne r
        }

        funcao inicio() {
          inteiro a = dobro(2)
          escreva(a)
        }
      }
    `;

    test("O próximo passo entra na função", async () => {
      const { pauses } = await debug(code);

      expect(lines(pauses)).toEqual([8, 3, 4, 9]);
      expect(pauses[1].frames.map(frame => frame.name)).toEqual(["dobro", "inicio"]);
      expect(variable(pauses[1], "n")).toMatchObject({ type: "inteiro", text: "2" });
      expect(variable(pauses[2], "r")).toMatchObject({ text: "4" });
      expect(variable(pauses[3], "a")).toMatchObject({ text: "4" });
    });

    test("Pular função executa a chamada inteira", async () => {
      const { pauses } = await debug(code, { resume: () => "stepOver" });

      expect(lines(pauses)).toEqual([8, 9]);
    });

    test("Sair da função para em quem chamou", async () => {
      const { pauses } = await debug(code, { resume: pause => (pause.line === 3 ? "stepOut" : "step") });

      expect(lines(pauses)).toEqual([8, 3, 9]);
    });

    test("Pular função numa recursão para na mesma chamada", async () => {
      const { pauses } = await debug(
        portugol`
          programa {
            funcao inteiro fat(inteiro n) {
              se (n <= 1) {
                retorne 1
              }
              retorne n * fat(n - 1)
            }

            funcao inicio() {
              escreva(fat(3))
            }
          }
        `,
        { resume: (pause, index) => (index < 2 ? "step" : "stepOver") },
      );

      // inicio, entra em fat(3), e daí em diante só pula: fica sempre em fat(3)
      expect(lines(pauses)).toEqual([10, 3, 6]);
      expect(pauses.at(-1)?.frames).toHaveLength(2);
    });
  });

  describe("Pontos de parada", () => {
    const code = portugol`
      programa {
        funcao inicio() {
          inteiro soma = 0
          para (inteiro i = 1; i <= 3; i++) {
            soma += i
          }
          escreva(soma)
        }
      }
    `;

    test("Com pontos de parada, começa executando e para só neles", async () => {
      const { pauses, output } = await debug(code, { breakpoints: [5], resume: () => "continue" });

      expect(lines(pauses)).toEqual([5, 5, 5]);
      expect(pauses.map(pause => variable(pause, "soma")?.text)).toEqual(["0", "1", "3"]);
      expect(output).toBe("6");
    });

    test("Os pontos de parada podem mudar durante a execução", async () => {
      const runner = new PortugolWorkerThreadsRunner(transpile(code, true));
      const pauses: number[] = [];

      await new Promise<void>(resolve => {
        runner.run({ debug: { breakpoints: [5] } }).subscribe(event => {
          if (event.type === "paused") {
            pauses.push(event.pause.line);
            runner.debug({ type: "breakpoints", lines: [7] });
            runner.debug({ type: "continue" });
          } else if (event.type === "finish") {
            resolve();
          }
        });
      });

      expect(pauses).toEqual([5, 7]);
    });
  });

  test("Pausar para um laço que não termina", async () => {
    const runner = new PortugolWorkerThreadsRunner(
      transpile(
        portugol`
          programa {
            funcao inicio() {
              inteiro i = 0
              enquanto (verdadeiro) {
                i++
              }
            }
          }
        `,
        true,
      ),
    );

    const pauses: DebugPause[] = [];

    await new Promise<void>(resolve => {
      runner.run({ debug: { breakpoints: [] } }).subscribe(event => {
        if (event.type === "paused") {
          pauses.push(event.pause);

          if (pauses.length === 1) {
            runner.debug({ type: "continue" });
            setTimeout(() => {
              runner.debug({ type: "pause" });
            }, 50);
          } else {
            runner.destroy(true);
          }
        } else if (event.type === "finish") {
          resolve();
        }
      });
    });

    expect(pauses).toHaveLength(2);
    expect(Number(variable(pauses[1], "i")?.text)).toBeGreaterThan(0);
  });

  test("Cada chamada tem um número, o mesmo durante a chamada e outro na seguinte", async () => {
    const { pauses } = await debug(portugol`
      programa {
        funcao f(inteiro n) {
          inteiro m = n
          escreva(m)
        }

        funcao inicio() {
          f(1)
          f(2)
        }
      }
    `);

    const calls = pauses.filter(pause => pause.frames[0]?.name === "f");
    const first = calls.filter(pause => variable(pause, "n")?.text === "1").map(pause => pause.frames[0].id);
    const second = calls.filter(pause => variable(pause, "n")?.text === "2").map(pause => pause.frames[0].id);

    expect(first).toHaveLength(2);
    expect(new Set(first).size).toBe(1);
    expect(new Set(second).size).toBe(1);
    expect(first[0]).not.toBe(second[0]);
    // O inicio continua o mesmo nas duas chamadas
    expect(new Set(calls.map(pause => pause.frames[1].id)).size).toBe(1);
  });

  test("Pausar com o programa já pausado não faz o Continuar parar de novo", async () => {
    const { pauses, output } = await debug(
      portugol`
        programa {
          funcao inicio() {
            escreva("a")
            escreva("b")
          }
        }
      `,
      {
        onPause: (runner, index) => {
          if (index === 0) {
            runner.debug({ type: "pause" });
          }
        },
        resume: () => "continue",
      },
    );

    expect(lines(pauses)).toEqual([3]);
    expect(output).toBe("ab");
  });

  test("Um ponto de parada marcado com o programa continuando faz ele parar", async () => {
    const runner = new PortugolWorkerThreadsRunner(
      transpile(
        portugol`
          programa {
            funcao inicio() {
              inteiro i = 0
              enquanto (verdadeiro) {
                i++
              }
            }
          }
        `,
        true,
      ),
    );

    const pauses: DebugPause[] = [];

    // Se o ponto de parada não valer, o laço não termina: o runner para com o teste
    onTestFinished(() => {
      runner.destroy(true);
    });

    await new Promise<void>(resolve => {
      runner.run({ debug: { breakpoints: [] } }).subscribe(event => {
        if (event.type === "paused") {
          pauses.push(event.pause);

          if (pauses.length === 1) {
            runner.debug({ type: "continue" });
            setTimeout(() => {
              runner.debug({ type: "breakpoints", lines: [5] });
            }, 50);
          } else {
            runner.destroy(true);
          }
        } else if (event.type === "finish") {
          resolve();
        }
      });
    });

    expect(lines(pauses)).toEqual([3, 5]);
  });

  test("Mostra globais, vetores, matrizes, cadeias, caracteres e lógicos", async () => {
    const { pauses } = await debug(portugol`
      programa {
        inteiro contador = 7

        funcao inicio() {
          inteiro v[3] = {1, 2, 3}
          real m[2][2] = {{1.5, 2.0}, {3.0, 4.0}}
          cadeia nome = "Ana"
          caracter letra = 'x'
          logico ok = verdadeiro
          const real PI = 3.14
          escreva("fim")
        }
      }
    `);

    const last = pauses.at(-1)!;

    expect(last.globals).toEqual([{ name: "contador", constant: false, type: "inteiro", text: "7" }]);
    expect(variable(last, "contador")).toBeUndefined();
    expect(variable(last, "v")).toMatchObject({
      type: "vetor",
      items: [
        { type: "inteiro", text: "1" },
        { type: "inteiro", text: "2" },
        { type: "inteiro", text: "3" },
      ],
    });
    expect(variable(last, "m")?.items?.[0]).toMatchObject({
      type: "vetor",
      items: [
        { type: "real", text: "1.5" },
        { type: "real", text: "2.0" },
      ],
    });
    expect(variable(last, "nome")).toMatchObject({ type: "cadeia", text: '"Ana"' });
    expect(variable(last, "letra")).toMatchObject({ type: "caracter", text: "'x'" });
    expect(variable(last, "ok")).toMatchObject({ type: "logico", text: "verdadeiro" });
    expect(variable(last, "PI")).toMatchObject({ constant: true, text: "3.14" });
  });

  test("O leia funciona durante a depuração", async () => {
    const { pauses, output } = await debug(
      portugol`
        programa {
          funcao inicio() {
            inteiro x
            leia(x)
            escreva(x * 2)
          }
        }
      `,
      { inputs: ["21"] },
    );

    expect(lines(pauses)).toEqual([3, 4, 5]);
    expect(variable(pauses[2], "x")).toMatchObject({ text: "21" });
    expect(output).toBe("42");
  });

  describe("Comandos", () => {
    test("Declarações com vários nomes, vetores, matrizes e constantes", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao inicio() {
            inteiro a = 1, b = 2, v[2] = {3, 4}, m[2][2]
            const inteiro K = 5
            escreva(a + b + K)
          }
        }
      `);

      expect(lines(pauses)).toEqual([3, 4, 5]);
      expect(pauses[1].frames[0].variables.map(v => v.name)).toEqual(["a", "b", "v", "m"]);
      expect(variable(pauses[2], "K")).toMatchObject({ constant: true, text: "5" });
      expect(output).toBe("8");
    });

    test("O senao se para em cada condição testada", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao inicio() {
            inteiro x = 2
            se (x == 1) escreva("um")
            senao se (x == 2) escreva("dois")
            senao escreva("outro")
          }
        }
      `);

      // No senao se, uma pausa na condição e outra no escreva
      expect(lines(pauses)).toEqual([3, 4, 5, 5]);
      expect(output).toBe("dois");
    });

    test("O escolha para no caso escolhido, e o pare sai só do escolha", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao inicio() {
            para (inteiro i = 0; i < 2; i++) {
              escolha (i) {
                caso 0:
                  escreva("zero")
                  pare
                caso contrario:
                  escreva("outro")
              }
            }
          }
        }
      `);

      expect(lines(pauses)).toEqual([3, 4, 6, 7, 3, 4, 9, 3]);
      expect(output).toBe("zerooutro");
    });

    test("O para sem inicialização, sem incremento ou só com a variável", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao inicio() {
            inteiro i = 0, s = 0
            para (; i < 2; i++) s++
            para (i = 0; i < 2; ) { i++ }
            para (i; i < 3; i++) s += 10
            escreva(s, " ", i)
          }
        }
      `);

      expect(lines(pauses)).toEqual([3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 7]);
      expect(output).toBe("12 3");
    });

    test("Laços sem chaves param no corpo e na condição", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao inicio() {
            inteiro i = 0
            enquanto (i < 2) i++
            faca i-- enquanto (i > 0)
            escreva(i)
          }
        }
      `);

      expect(lines(pauses)).toEqual([3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6]);
      expect(output).toBe("0");
    });

    test("Um comando em várias linhas para na primeira", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao inicio() {
            escreva("a",
              "b")
            inteiro x =
              2
            escreva(x)
          }
        }
      `);

      expect(lines(pauses)).toEqual([3, 5, 7]);
      expect(output).toBe("ab2");
    });

    test("O retorne dentro de laços sai da função", async () => {
      const { output } = await debug(portugol`
        programa {
          funcao inteiro achar(inteiro alvo) {
            para (inteiro i = 0; i < 10; i++) {
              enquanto (verdadeiro) {
                se (i == alvo) {
                  retorne i
                }
                pare
              }
            }
            retorne -1
          }

          funcao inicio() {
            escreva(achar(1))
          }
        }
      `);

      expect(output).toBe("1");
    });

    test("O e e o ou continuam sem avaliar o segundo lado quando não precisam", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao logico f() {
            escreva("chamou")
            retorne verdadeiro
          }

          funcao inicio() {
            se (falso e f()) escreva("x")
            se (verdadeiro ou f()) escreva("y")
          }
        }
      `);

      expect(lines(pauses)).toEqual([8, 9, 9]);
      expect(output).toBe("y");
    });

    test("Um parâmetro por referência muda a variável de quem chamou", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          funcao dobra(inteiro &y) {
            y = y * 2
          }

          funcao inicio() {
            inteiro z = 5
            dobra(z)
            escreva(z)
          }
        }
      `);

      expect(lines(pauses)).toEqual([7, 8, 3, 9]);
      expect(variable(pauses[2], "y")).toMatchObject({ text: "5" });
      expect(variable(pauses[3], "z")).toMatchObject({ text: "10" });
      expect(output).toBe("10");
    });

    test("Um parâmetro por referência com o nome de uma global aparece na função", async () => {
      const { pauses } = await debug(portugol`
        programa {
          inteiro x = 1

          funcao dobra(inteiro &x) {
            x = x * 2
          }

          funcao inicio() {
            dobra(x)
          }
        }
      `);

      expect(lines(pauses)).toEqual([9, 5]);
      expect(variable(pauses[1], "x")).toMatchObject({ text: "1" });
      expect(pauses[1].globals).toMatchObject([{ name: "x", text: "1" }]);
    });

    test("Uma função de biblioteca com o nome de uma do programa não entra na pilha", async () => {
      const { pauses, output } = await debug(portugol`
        programa {
          inclua biblioteca Matematica --> mat

          funcao real raiz(real n) {
            retorne n
          }

          funcao inicio() {
            real r = mat.raiz(16.0, 2.0)
            escreva(r, " ", raiz(3.0))
          }
        }
      `);

      expect(pauses.map(pause => pause.frames.map(frame => frame.name))).toEqual([
        ["inicio"],
        ["inicio"],
        ["raiz", "inicio"],
      ]);
      expect(output).toBe("4.0 3.0");
    });
  });

  test("Pular função para num ponto de parada dentro da função", async () => {
    const { pauses } = await debug(
      portugol`
        programa {
          funcao f() {
            inteiro a = 1
            a = 2
          }

          funcao inicio() {
            f()
            escreva("x")
          }
        }
      `,
      { breakpoints: [8, 4], resume: (_, index) => (index === 0 ? "stepOver" : "continue") },
    );

    expect(lines(pauses)).toEqual([8, 4]);
  });

  test("Sair da função no inicio vai até o fim", async () => {
    const { pauses, output } = await debug(
      portugol`
        programa {
          funcao inicio() {
            escreva("x")
            escreva("y")
          }
        }
      `,
      { resume: () => "stepOut" },
    );

    expect(lines(pauses)).toEqual([3]);
    expect(output).toBe("xy");
  });

  test("Pausar durante um leia pausa no comando seguinte", async () => {
    const runner = new PortugolWorkerThreadsRunner(
      transpile(
        portugol`
          programa {
            funcao inicio() {
              inteiro x
              leia(x)
              escreva(x + 1)
            }
          }
        `,
        true,
      ),
    );

    const pauses: DebugPause[] = [];

    await new Promise<void>(resolve => {
      runner.run({ debug: { breakpoints: [] } }).subscribe(event => {
        switch (event.type) {
          case "paused": {
            pauses.push(event.pause);
            runner.debug({ type: "continue" });
            break;
          }

          case "stdIn": {
            runner.debug({ type: "pause" });
            setTimeout(() => {
              runner.stdIn.next("5");
            }, 50);
            break;
          }

          case "finish": {
            resolve();
            break;
          }
        }
      });
    });

    // Sem pontos de parada, começa pausado no primeiro comando
    expect(lines(pauses)).toEqual([3, 5]);
  });

  test("Um erro de execução durante a depuração termina o programa", async () => {
    await expect(
      debug(portugol`
        programa {
          funcao inicio() {
            inteiro a = 0
            escreva(1 / a)
          }
        }
      `),
    ).rejects.toThrow("Foi efetuada uma divisão por zero.");
  });
});
