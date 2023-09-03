import { DeclaracaoContext, ListaDeclaracoesContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { DeclaraçãoMatrizExpr } from "./DeclaraçãoMatrizExpr.js";
import { DeclaraçãoVariávelExpr } from "./DeclaraçãoVariávelExpr.js";
import { DeclaraçãoVetorExpr } from "./DeclaraçãoVetorExpr.js";
import { Expressão } from "./Expressão.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";
import { Tipo, parseTipoPrimitivo } from "../helpers/Tipo.js";

export class DeclaraçãoCmd extends Comando {
  nome: string;
  tipo: Tipo;
  expressão?: Expressão;
  constante: boolean;

  constructor(
    public ctx: DeclaracaoContext,
    public children: Node[],
  ) {
    super(ctx, children);

    invariant(ctx.parent instanceof ListaDeclaracoesContext, ctx);

    this.tipo = { primitivo: parseTipoPrimitivo(ctx.parent.TIPO()) };
    this.constante = Boolean(ctx.parent.CONSTANTE());

    for (const child of children) {
      if (child instanceof Expressão) {
        invariant(!this.expressão, child.ctx, "Expressão já definida");

        if (child instanceof DeclaraçãoVetorExpr) {
          this.nome = child.nome;
          this.tipo = {
            dimensão: "vetor",
            tamanho: child.tamanho,
            primitivo: this.tipo.primitivo,
          };

          this.expressão = child.inicialização;
        } else if (child instanceof DeclaraçãoMatrizExpr) {
          this.nome = child.nome;
          this.tipo = {
            dimensão: "matriz",
            linhas: child.linhas,
            colunas: child.colunas,
            primitivo: this.tipo.primitivo,
          };
        } else if (child instanceof DeclaraçãoVariávelExpr) {
          this.nome = child.nome;
          this.expressão = child.valor;
        } else {
          this.unexpectedChild(child);
        }
      } else {
        this.unexpectedChild(child);
      }
    }

    invariant(this.nome, ctx, "Nome não definido");
  }
}
