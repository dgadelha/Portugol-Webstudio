import { AdicaoSubtracaoContext, ArquivoContext, MultiplicacaoDivisaoModuloContext, PortugolParser, PortugolVisitor } from "@portugol-webstudio/antlr";
import { AbstractParseTreeVisitor, ParseTree } from "antlr4ng";

import { Arquivo, Bypass, ContextNodeObj, DivisãoExpr, MultiplicaçãoExpr, MóduloExpr, Node, SomaExpr, SubtraçãoExpr, UnhandledNode } from "./nodes/index.js";

export interface Empty {}

export class PortugolNode extends AbstractParseTreeVisitor<Empty> implements PortugolVisitor<Empty> {
  protected defaultResult(): Empty {
    return {};
  }

  protected aggregateResult(_aggregate: Empty, _nextResult: Empty): Empty {
    throw new Error("Shouldn't need to aggregate results");
  }

  visitChildrenFromParent(ctx: ParseTree, parent: Node) {
    for (let i = 0; i < ctx.getChildCount(); i++) {
      const child = ctx.getChild(i);

      if (!child || child.constructor.name === "TerminalNode") {
        continue;
      }

      this.visitFromParent(child, parent);
    }
  }

  visitFromParent(ctx: ParseTree, parent: Node) {
    const ctor = ContextNodeObj[ctx.constructor.name] ?? this.resolveCompositeCtor(ctx);
    let obj;

    if (ctor) {
      obj = new ctor(ctx);
    } else {
      obj = new UnhandledNode(ctx, ctx.constructor.name);
    }

    if (obj instanceof Bypass) {
      this.visitChildrenFromParent(ctx, parent);
    } else {
      this.visitChildrenFromParent(ctx, obj);
      parent.addChild(obj);
    }
  }

  private resolveCompositeCtor(ctx: ParseTree): (new (ctx: any) => Node) | undefined {
    if (ctx instanceof MultiplicacaoDivisaoModuloContext) {
      switch (ctx._op?.type) {
        case PortugolParser.OP_MULTIPLICACAO:
          return MultiplicaçãoExpr;
        case PortugolParser.OP_DIVISAO:
          return DivisãoExpr;
        case PortugolParser.OP_MOD:
          return MóduloExpr;
      }
    }

    if (ctx instanceof AdicaoSubtracaoContext) {
      switch (ctx._op?.type) {
        case PortugolParser.OP_ADICAO:
          return SomaExpr;
        case PortugolParser.OP_SUBTRACAO:
          return SubtraçãoExpr;
      }
    }

    return undefined;
  }

  visit(ctx: ParseTree) {
    if (ctx.constructor.name !== "ArquivoContext") {
      throw new Error("O algoritmo Portugol deve-se iniciar com um contexto de arquivo (palavra-chave 'programa')");
    }

    const arquivo = new Arquivo(ctx as ArquivoContext);

    this.visitChildrenFromParent(ctx, arquivo);

    return arquivo;
  }
}
