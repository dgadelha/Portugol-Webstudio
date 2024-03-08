import { PortugolCodeError } from "@portugol-webstudio/antlr";

import { ResultadoCompatibilidade, TabelaCompatibilidadeAtribuição } from "../helpers/compatibilidade.js";
import { Escopo } from "../helpers/Escopo.js";
import { resolverResultadoExpressão } from "../helpers/expressões.js";
import {
  Arquivo,
  AtribuiçãoCmd,
  DeclaraçãoCmd,
  EnquantoCmd,
  EscolhaCmd,
  FaçaEnquantoCmd,
  Função,
  Node,
  ParaCmd,
  Parâmetro,
  ReferênciaVarExpr,
  SeCmd,
} from "../nodes/index.js";

export function* checarUsoEscopo(arquivo: Arquivo): Generator<PortugolCodeError> {
  const escopo = new Escopo();

  function* varrerNós(nós: Node[]) {
    for (const nó of nós) {
      yield* varrerNó(nó);
    }
  }

  function* varrerNó(nó: Node): Generator<PortugolCodeError> {
    switch (nó.constructor) {
      case DeclaraçãoCmd:
      case Parâmetro:
        const declr = nó as DeclaraçãoCmd | Parâmetro;

        escopo.variáveis.set(declr.nome, declr.tipo);
        break;

      case ReferênciaVarExpr:
        const ref = nó as ReferênciaVarExpr;

        // TODO: bibliotecas
        if (ref.escopoBiblioteca) {
          break;
        }

        if (!escopo.hasVariável(ref.nome)) {
          yield PortugolCodeError.fromContext(ref.ctx, `Variável não declarada: ${ref.nome}`);
        }

        break;

      case AtribuiçãoCmd:
        const attr = nó as AtribuiçãoCmd;

        yield* varrerNós(attr.children);

        // TODO: bibliotecas
        if (attr.variável instanceof ReferênciaVarExpr && !attr.variável.escopoBiblioteca) {
          const svar = escopo.variáveis.get(attr.variável.nome);

          if (!svar) {
            break;
          }

          try {
            const tret = resolverResultadoExpressão(attr.expressão, escopo);

            if (TabelaCompatibilidadeAtribuição[svar.primitivo][tret] === ResultadoCompatibilidade.INCOMPATÍVEL) {
              yield PortugolCodeError.fromContext(
                attr.ctx,
                `Não é possível atribuir um valor do tipo '${tret}' a uma variável do tipo '${svar.primitivo}'`,
              );
            }
          } catch (e) {
            const message = e instanceof Error ? e.message : "Não foi possível resolver o tipo da expressão";

            if (message === "TODO") {
              break;
            }

            yield PortugolCodeError.fromContext(attr.ctx, message);
          }
        }

        // TODO: array e matriz

        break;

      case EnquantoCmd:
      case EscolhaCmd:
      case FaçaEnquantoCmd:
      case Função:
      case ParaCmd:
        escopo.push();
        yield* varrerNós(nó.children);
        escopo.pop();
        break;

      case SeCmd:
        const se = nó as SeCmd;

        escopo.push();
        yield* varrerNó(se.condição);
        yield* varrerNós(se.instruções);
        escopo.pop();

        if (se.senão) {
          escopo.push();
          yield* varrerNós(se.senão.instruções);
          escopo.pop();
        }

        break;

      default:
        yield* varrerNós(nó.children);
        break;
    }
  }

  yield* varrerNó(arquivo);
}
