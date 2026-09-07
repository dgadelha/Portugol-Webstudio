import { PortugolCodeDiagnostic, PortugolDiagnosticSeverity } from "@portugol-webstudio/antlr";

import {
  ResultadoCompatibilidade,
  TabelaCompatibilidadeAtribuição,
  TabelaCompatibilidadeRetornoFunção,
} from "../helpers/compatibilidade.js";
import { Escopo } from "../helpers/Escopo.js";
import { resolverResultadoExpressão } from "../helpers/expressões.js";
import { TipoPrimitivo } from "../index.js";
import {
  Arquivo,
  AtribuiçãoCmd,
  ChamadaFunçãoExpr,
  DeclaraçãoCmd,
  EnquantoCmd,
  EscolhaCmd,
  FaçaEnquantoCmd,
  Função,
  Node,
  ParaCmd,
  Parâmetro,
  ReferênciaArrayExpr,
  ReferênciaMatrizExpr,
  ReferênciaVarExpr,
  RetorneCmd,
  SeCmd,
} from "../nodes/index.js";

function checkVariableWarnings(escopo: Escopo): PortugolCodeDiagnostic[] {
  const diagnostics: PortugolCodeDiagnostic[] = [];

  for (const [nome, variável] of escopo.variáveis) {
    if (variável.leitura.length > 0 && variável.escrita.length === 0) {
      diagnostics.push(
        PortugolCodeDiagnostic.fromContext(
          variável.declaração!.ctx,
          `A variável '${nome}' é lida, mas nunca recebe um valor`,
          PortugolDiagnosticSeverity.Warning,
        ),
      );
    }

    if (variável.leitura.length === 0 && variável.escrita.length > 0) {
      diagnostics.push(
        PortugolCodeDiagnostic.fromContext(
          variável.declaração!.ctx,
          `A variável '${nome}' é atribuída, mas nunca é lida`,
          PortugolDiagnosticSeverity.Warning,
        ),
      );
    }

    if (variável.leitura.length === 0 && variável.escrita.length === 0) {
      diagnostics.push(
        PortugolCodeDiagnostic.fromContext(
          variável.declaração!.ctx,
          `A variável '${nome}' é declarada, mas não é utilizada`,
          PortugolDiagnosticSeverity.Warning,
        ),
      );
    }
  }

  return diagnostics;
}

function functionParameterMismatchMessage(call: ChamadaFunçãoExpr, tfunName: string, expected: number, got: number) {
  if (expected === 0) {
    return `A função '${tfunName}' não deve receber argumentos`;
  }

  if (got === 0) {
    return `A função '${tfunName}' deve receber argumentos`;
  }

  return `A função '${tfunName}' espera receber ${expected} argumento${expected > 1 ? "s" : ""}, mas recebeu ${got}`;
}

function isTypeCompatible(expected: TipoPrimitivo, actual: TipoPrimitivo) {
  return TabelaCompatibilidadeAtribuição[expected][actual] !== ResultadoCompatibilidade.INCOMPATÍVEL;
}

export function* checarUsoEscopo(arquivo: Arquivo): Generator<PortugolCodeDiagnostic> {
  const escopo = new Escopo();

  function* varrerNós(nós: Node[]): Generator<PortugolCodeDiagnostic> {
    for (const nó of nós) {
      yield* varrerNó(nó);
    }
  }

  function* varrerNó(nó: Node): Generator<PortugolCodeDiagnostic> {
    switch (nó.constructor) {
      case DeclaraçãoCmd:
      case Parâmetro: {
        const declr = nó as DeclaraçãoCmd | Parâmetro;

        yield* varrerNós(declr.children);

        if (escopo.variáveis.has(declr.nome)) {
          yield PortugolCodeDiagnostic.fromContext(
            declr.ctx,
            `Redeclaração de variável '${declr.nome}' no mesmo escopo`,
            PortugolDiagnosticSeverity.Error,
          );

          return;
        }

        escopo.variáveis.set(declr.nome, {
          nome: declr.nome,
          tipo: declr.tipo,
          declaração: nó,
          leitura: [],
          escrita: declr instanceof Parâmetro || declr.expressão ? [declr] : [],
        });

        break;
      }

      case Função: {
        const func = nó as Função;

        escopo.push();
        escopo.função = func;

        for (const param of func.parâmetros) {
          if (escopo.variáveis.has(param.nome)) {
            yield PortugolCodeDiagnostic.fromContext(
              param.ctx,
              `Redeclaração de parâmetro '${param.nome}' na função '${func.nome}'`,
              PortugolDiagnosticSeverity.Error,
            );
          } else {
            escopo.variáveis.set(param.nome, {
              nome: param.nome,
              tipo: param.tipo,
              declaração: param,
              // TODO: Parar de assumir que referência sempre vai ter leitura na variável
              leitura: param.referência ? [param] : [],
              escrita: [param],
            });
          }
        }

        yield* varrerNós(func.instruções);

        for (const diagnostic of checkVariableWarnings(escopo)) {
          yield diagnostic;
        }

        escopo.pop();
        break;
      }

      case ReferênciaVarExpr: {
        const ref = nó as ReferênciaVarExpr;

        // TODO: bibliotecas
        if (ref.escopoBiblioteca) {
          break;
        }

        const variable = escopo.getVariável(ref.nome);

        if (variable) {
          variable.leitura.push(ref);
        } else {
          yield PortugolCodeDiagnostic.fromContext(
            ref.ctx,
            `Variável não declarada: ${ref.nome}`,
            PortugolDiagnosticSeverity.Error,
          );
        }
        break;
      }

      case ReferênciaArrayExpr: {
        const ref = nó as ReferênciaArrayExpr;

        yield* varrerNó(ref.variável);
        yield* varrerNó(ref.índice);

        break;
      }

      case ReferênciaMatrizExpr: {
        const ref = nó as ReferênciaMatrizExpr;

        yield* varrerNó(ref.variável);
        yield* varrerNó(ref.linha);
        yield* varrerNó(ref.coluna);

        break;
      }

      case AtribuiçãoCmd: {
        const attr = nó as AtribuiçãoCmd;

        yield* varrerNó(attr.expressão);

        if (
          (attr.variável instanceof ReferênciaVarExpr && !attr.variável.escopoBiblioteca) ||
          (attr.variável instanceof ReferênciaArrayExpr && !attr.variável.variável.escopoBiblioteca) ||
          (attr.variável instanceof ReferênciaMatrizExpr && !attr.variável.variável.escopoBiblioteca)
        ) {
          const variableName =
            attr.variável instanceof ReferênciaVarExpr ? attr.variável.nome : attr.variável.variável.nome;
          const variable = escopo.getVariável(variableName);

          if (variable) {
            variable.escrita.push(attr);

            try {
              const valueType = resolverResultadoExpressão(attr.expressão, escopo);

              if (variable.tipo && !isTypeCompatible(variable.tipo.primitivo, valueType)) {
                yield PortugolCodeDiagnostic.fromContext(
                  attr.ctx,
                  `Não é possível atribuir um valor do tipo '${valueType}' a uma variável do tipo '${variable.tipo.primitivo}'`,
                  PortugolDiagnosticSeverity.Error,
                );
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "Não foi possível resolver o tipo da expressão";

              if (message !== "TODO") {
                yield PortugolCodeDiagnostic.fromContext(attr.ctx, message, PortugolDiagnosticSeverity.Error);
              }
            }
          } else {
            yield PortugolCodeDiagnostic.fromContext(
              attr.variável.ctx,
              `Variável não declarada: ${variableName}`,
              PortugolDiagnosticSeverity.Error,
            );
          }
        }

        break;
      }

      case EnquantoCmd:
      case EscolhaCmd:
      case FaçaEnquantoCmd:
      case ParaCmd: {
        escopo.push();

        yield* varrerNós(nó.children);

        for (const diagnostic of checkVariableWarnings(escopo)) {
          yield diagnostic;
        }

        escopo.pop();
        break;
      }

      case SeCmd: {
        const se = nó as SeCmd;

        escopo.push();

        yield* varrerNó(se.condição);
        yield* varrerNós(se.instruções);

        for (const diagnostic of checkVariableWarnings(escopo)) {
          yield diagnostic;
        }

        escopo.pop();

        if (se.senão) {
          escopo.push();
          yield* varrerNós(se.senão.instruções);

          for (const diagnostic of checkVariableWarnings(escopo)) {
            yield diagnostic;
          }

          escopo.pop();
        }

        break;
      }

      case RetorneCmd: {
        const ret = nó as RetorneCmd;

        if (ret.expressão) {
          yield* varrerNó(ret.expressão);
        }

        if (!escopo.função) {
          yield PortugolCodeDiagnostic.fromContext(
            ret.ctx,
            "'retorne' fora de função",
            PortugolDiagnosticSeverity.Error,
          );

          break;
        }

        if (ret.expressão) {
          try {
            const resultado = resolverResultadoExpressão(ret.expressão, escopo);

            if (
              TabelaCompatibilidadeRetornoFunção[escopo.função.retorno.primitivo][resultado] ===
              ResultadoCompatibilidade.INCOMPATÍVEL
            ) {
              yield PortugolCodeDiagnostic.fromContext(
                ret.ctx,
                `Não é possível retornar um valor do tipo '${resultado}' em uma função que retorna '${escopo.função.retorno.primitivo}'`,
                PortugolDiagnosticSeverity.Error,
              );
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "Não foi possível resolver o tipo da expressão";

            if (message !== "TODO") {
              yield PortugolCodeDiagnostic.fromContext(ret.ctx, message, PortugolDiagnosticSeverity.Error);
            }
          }
        }

        break;
      }

      case ChamadaFunçãoExpr: {
        const call = nó as ChamadaFunçãoExpr;

        // Reminder: manter antes do break abaixo para que argumentos sejam verificados mesmo em chamadas de bibliotecas
        for (const arg of call.argumentos) {
          yield* varrerNó(arg);
        }

        // TODO: bibliotecas
        if (call.escopoBiblioteca) {
          break;
        }

        const tfun = escopo.getFunção(call.nome);

        if (!tfun) {
          yield PortugolCodeDiagnostic.fromContext(
            call.ctx,
            `Função não declarada: ${call.nome}`,
            PortugolDiagnosticSeverity.Error,
          );

          break;
        }

        if (tfun.parâmetros) {
          if (call.argumentos.length < tfun.parâmetros.length) {
            yield PortugolCodeDiagnostic.fromContext(
              call.ctx,
              functionParameterMismatchMessage(call, call.nome, tfun.parâmetros.length, call.argumentos.length),
              PortugolDiagnosticSeverity.Error,
            );

            for (let i = call.argumentos.length; i < tfun.parâmetros.length; i++) {
              const missingParam = tfun.parâmetros[i];

              yield PortugolCodeDiagnostic.fromContext(
                call.ctx,
                `${i + 1}º argumento '${missingParam.nome}' do tipo '${missingParam.tipo?.primitivo}' ausente na chamada da função '${call.nome}'`,
                PortugolDiagnosticSeverity.Error,
              );
            }
          } else if (call.argumentos.length > tfun.parâmetros.length) {
            yield PortugolCodeDiagnostic.fromContext(
              call.ctx,
              functionParameterMismatchMessage(call, call.nome, tfun.parâmetros.length, call.argumentos.length),
              PortugolDiagnosticSeverity.Error,
            );
          }

          for (let i = 0; i < Math.min(call.argumentos.length, tfun.parâmetros.length); i++) {
            const param = tfun.parâmetros[i];
            const arg = call.argumentos[i];

            // TODO: Parar de assumir que referência sempre vai escrever na variável
            if (param.referência) {
              if (arg instanceof ReferênciaVarExpr) {
                const varRef = arg;
                const variável = escopo.getVariável(varRef.nome);

                if (variável) {
                  variável.escrita.push(varRef);
                }
              }
            }

            if (!param.tipo) {
              continue;
            }

            try {
              const argType = resolverResultadoExpressão(arg, escopo);

              if (!isTypeCompatible(param.tipo.primitivo, argType)) {
                yield PortugolCodeDiagnostic.fromContext(
                  arg.ctx,
                  `Não é possível passar um valor do tipo '${argType}' para o parâmetro '${param.nome}' do tipo '${param.tipo.primitivo}' na função '${call.nome}'`,
                  PortugolDiagnosticSeverity.Error,
                );
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "Não foi possível resolver o tipo da expressão";

              if (message !== "TODO") {
                yield PortugolCodeDiagnostic.fromContext(arg.ctx, message, PortugolDiagnosticSeverity.Error);
              }
            }
          }
        }

        if (tfun.nome === "leia") {
          for (const arg of call.argumentos) {
            if (arg instanceof ReferênciaVarExpr) {
              const varRef = arg;
              const variável = escopo.getVariável(varRef.nome);

              if (variável) {
                if (variável.tipo.primitivo === TipoPrimitivo.VAZIO) {
                  yield PortugolCodeDiagnostic.fromContext(
                    varRef.ctx,
                    `Não é possível ler um valor em uma variável do tipo 'vazio'`,
                    PortugolDiagnosticSeverity.Error,
                  );
                }

                variável.escrita.push(varRef);
              }
            }
          }
        }

        break;
      }

      default: {
        if (nó.children && nó.children.length > 0) {
          yield* varrerNós(nó.children);
        }

        break;
      }
    }
  }

  for (const func of arquivo.funções) {
    if (escopo.hasFunção(func.nome)) {
      yield PortugolCodeDiagnostic.fromContext(
        func.ctx,
        `Redeclaração de função '${func.nome}'`,
        PortugolDiagnosticSeverity.Error,
      );

      continue;
    }

    escopo.funções.set(func.nome, {
      nome: func.nome,
      parâmetros: func.parâmetros.map(par => {
        return {
          nome: par.nome,
          tipo: par.tipo,
          referência: par.referência,
          declaração: par,
          leitura: [],
        };
      }),
      retorno: func.retorno,
      declaração: func,
      chamadas: [],
    });
  }

  yield* varrerNós(arquivo.bibliotecas);
  yield* varrerNós(arquivo.declarações);
  yield* varrerNós(arquivo.funções);

  for (const diagnostic of checkVariableWarnings(escopo)) {
    yield diagnostic;
  }
}
