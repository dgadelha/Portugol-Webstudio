import { DeclaracaoContext, ListaDeclaracoesContext } from "@portugol-webstudio/antlr";
import { Token } from "antlr4ng";

import { invariant } from "../helpers/nodes.js";
import { Tipo, parseTipoPrimitivo } from "../analise/TipoDado.js";
import { Comando } from "./Comando.js";
import { DeclaraçãoMatrizExpr } from "./DeclaraçãoMatrizExpr.js";
import { DeclaraçãoVariávelExpr } from "./DeclaraçãoVariávelExpr.js";
import { DeclaraçãoVetorExpr } from "./DeclaraçãoVetorExpr.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";

export class DeclaraçãoCmd extends Comando<DeclaracaoContext> {
  nome!: string;
  nomeToken!: Token;
  tipo!: Tipo;
  expressão?: Expressão;
  constante!: boolean;

  constructor(public ctx: DeclaracaoContext) {
    super(ctx);

    invariant(ctx.parent instanceof ListaDeclaracoesContext, ctx);

    this.tipo = { primitivo: parseTipoPrimitivo(ctx.parent.TIPO()) };
    this.constante = Boolean(ctx.parent.CONSTANTE());
  }

  addChild(child: Node) {
    if (child instanceof Expressão) {
      invariant(!this.expressão, child.ctx, "Expressão já definida");

      if (child instanceof DeclaraçãoVetorExpr) {
        this.nome = child.nome;
        this.nomeToken = child.nomeToken;
        this.tipo = {
          dimensão: "vetor",
          tamanho: child.tamanho,
          primitivo: this.tipo.primitivo,
        };

        this.expressão = child.valor;
      } else if (child instanceof DeclaraçãoMatrizExpr) {
        this.nome = child.nome;
        this.nomeToken = child.nomeToken;
        this.tipo = {
          dimensão: "matriz",
          linhas: child.linhas,
          colunas: child.colunas,
          primitivo: this.tipo.primitivo,
        };

        this.expressão = child.valor;
      } else if (child instanceof DeclaraçãoVariávelExpr) {
        this.nome = child.nome;
        this.nomeToken = child.nomeToken;
        this.expressão = child.valor;
      } else {
        this.unexpectedChild(child);
      }
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
