import { PortugolCodeError } from "@portugol-webstudio/antlr";

import { Tipo } from "../helpers/Tipo.js";
import { Arquivo } from "../nodes/Arquivo.js";
import { AtribuiçãoCmd } from "../nodes/AtribuiçãoCmd.js";
import { CadeiaExpr } from "../nodes/CadeiaExpr.js";
import { CaractereExpr } from "../nodes/CaractereExpr.js";
import { ChamadaFunçãoExpr } from "../nodes/ChamadaFunçãoExpr.js";
import { Comando } from "../nodes/Comando.js";
import { DeclaraçãoCmd } from "../nodes/DeclaraçãoCmd.js";
import { Expressão } from "../nodes/Expressão.js";
import { InteiroExpr } from "../nodes/InteiroExpr.js";
import { LógicoExpr } from "../nodes/LógicoExpr.js";
import { Node } from "../nodes/Node.js";
import { RealExpr } from "../nodes/RealExpr.js";
import { ReferênciaVarExpr } from "../nodes/ReferênciaVarExpr.js";

interface Escopo {
  variáveis: Map<string, Tipo>;
  funções: Map<string, Tipo>;
}

function getAllChildren(node: Node): Node[] {
  return node.children.flatMap(child => [child, ...getAllChildren(child)]);
}

export function* checarUsoEscopo(arquivo: Arquivo) {
  const escopo: Escopo = {
    variáveis: new Map<string, Tipo>(),
    funções: new Map<string, Tipo>([
      ["escreva", { primitivo: "vazio" }],
      ["leia", { primitivo: "cadeia" }],
      ["limpa", { primitivo: "vazio" }],
    ]),
  };

  for (const declr of arquivo.declarações) {
    if (escopo.variáveis.has(declr.nome)) {
      yield PortugolCodeError.fromContext(declr.ctx, `A variável '${declr.nome}' foi declarada múltiplas vezes`);
    }

    escopo.variáveis.set(declr.nome, declr.tipo);
  }

  for (const func of arquivo.funções) {
    if (escopo.funções.has(func.nome)) {
      yield PortugolCodeError.fromContext(func.ctx, `A função '${func.nome}' foi declarada múltiplas vezes`);
    }

    escopo.funções.set(func.nome, func.retorno);
  }

  for (const func of arquivo.funções) {
    const escopoFunção: Escopo = {
      variáveis: new Map(escopo.variáveis),
      funções: new Map(escopo.funções),
    };

    for (const param of func.parâmetros) {
      if (escopoFunção.variáveis.has(param.nome)) {
        yield PortugolCodeError.fromContext(param.ctx, `O parâmetro '${param.nome}' foi declarado múltiplas vezes`);
      }

      escopoFunção.variáveis.set(param.nome, param.tipo);
    }

    const instruções: Array<Comando | Expressão> = func.instruções.concat(
      func.instruções.flatMap(getAllChildren) as Array<Comando | Expressão>,
    );

    for (const expr of instruções) {
      if (expr instanceof DeclaraçãoCmd) {
        if (escopoFunção.variáveis.has(expr.nome)) {
          yield PortugolCodeError.fromContext(expr.ctx, `A variável '${expr.nome}' foi declarada múltiplas vezes`);
        }

        escopoFunção.variáveis.set(expr.nome, expr.tipo);
      } else if (expr instanceof AtribuiçãoCmd) {
        const nome = expr.variável instanceof ReferênciaVarExpr ? expr.variável.nome : expr.variável.variável.nome;

        if (!escopoFunção.variáveis.has(nome)) {
          yield PortugolCodeError.fromContext(expr.ctx, `A variável '${nome}' não foi declarada`);
        }

        const variável = escopoFunção.variáveis.get(nome);

        if (expr.expressão instanceof ChamadaFunçãoExpr) {
          if (
            !expr.expressão.escopoBiblioteca &&
            expr.expressão.nome !== "leia" &&
            escopoFunção.funções.get(expr.expressão.nome)?.primitivo !== variável?.primitivo
          ) {
            yield PortugolCodeError.fromContext(
              expr.ctx,
              `A função '${expr.expressão.nome}' não retorna um valor do tipo '${variável?.primitivo}'`,
            );
          }
        } else if (expr.expressão instanceof ReferênciaVarExpr) {
          if (escopoFunção.variáveis.get(expr.expressão.nome)?.primitivo !== variável?.primitivo) {
            yield PortugolCodeError.fromContext(
              expr.ctx,
              `A variável '${expr.expressão.nome}' não é do tipo '${variável?.primitivo}'`,
            );
          }
        } else if (expr.expressão instanceof InteiroExpr) {
          if (variável?.primitivo !== "inteiro") {
            yield PortugolCodeError.fromContext(
              expr.ctx,
              `A variável '${nome}' esperava ser atribuída com um valor do tipo '${variável?.primitivo}', mas recebeu um valor do tipo 'inteiro'`,
            );
          }
        } else if (expr.expressão instanceof RealExpr) {
          if (variável?.primitivo !== "real") {
            yield PortugolCodeError.fromContext(
              expr.ctx,
              `A variável '${nome}' esperava ser atribuída com um valor do tipo '${variável?.primitivo}', mas recebeu um valor do tipo 'real'`,
            );
          }
        } else if (expr.expressão instanceof CadeiaExpr) {
          if (variável?.primitivo !== "cadeia") {
            yield PortugolCodeError.fromContext(
              expr.ctx,
              `A variável '${nome}' esperava ser atribuída com um valor do tipo '${variável?.primitivo}', mas recebeu um valor do tipo 'cadeia'`,
            );
          }
        } else if (expr.expressão instanceof CaractereExpr) {
          if (variável?.primitivo !== "caracter") {
            yield PortugolCodeError.fromContext(
              expr.ctx,
              `A variável '${nome}' esperava ser atribuída com um valor do tipo '${variável?.primitivo}', mas recebeu um valor do tipo 'caracter'`,
            );
          }
        } else if (expr.expressão instanceof LógicoExpr) {
          if (variável?.primitivo !== "logico") {
            yield PortugolCodeError.fromContext(
              expr.ctx,
              `A variável '${nome}' esperava ser atribuída com um valor do tipo '${variável?.primitivo}', mas recebeu um valor do tipo 'logico'`,
            );
          }
        }
      } else if (expr instanceof ReferênciaVarExpr) {
        if (!escopoFunção.variáveis.has(expr.nome)) {
          yield PortugolCodeError.fromContext(expr.ctx, `A variável '${expr.nome}' não foi declarada`);
        }
      } else if (expr instanceof ChamadaFunçãoExpr) {
        if (!expr.escopoBiblioteca && !escopoFunção.funções.has(expr.nome)) {
          yield PortugolCodeError.fromContext(expr.ctx, `A função '${expr.nome}' não foi declarada`);
        }

        const args = expr.argumentos;

        for (const arg of args) {
          if (arg instanceof ChamadaFunçãoExpr) {
            if (!arg.escopoBiblioteca && !escopoFunção.funções.has(arg.nome)) {
              yield PortugolCodeError.fromContext(arg.ctx, `A função '${arg.nome}' não foi declarada`);
            }

            const tipo = escopoFunção.funções.get(arg.nome);

            if (tipo?.primitivo === "vazio") {
              yield PortugolCodeError.fromContext(arg.ctx, `A função '${arg.nome}' não retorna um valor`);
            }
          }
        }
      }
    }
  }
}
