import { ArquivoContext, PortugolVisitor } from "@portugol-webstudio/antlr";
import { AbstractParseTreeVisitor, ParseTree } from "antlr4ng";

import { ParseError } from "./helpers/ParseError.js";
import { Arquivo, Bypass, ContextNodeObj, Node, UnhandledNode } from "./nodes/index.js";

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
    const ctor = ContextNodeObj[ctx.constructor.name];
    let obj;

    if (ctor) {
      obj = new ctor(ctx);
    } else {
      obj = new UnhandledNode(ctx, ctx.constructor.name);
    }

    if (obj instanceof Bypass) {
      this.visitChildrenFromParent(ctx, parent);
    } else {
      parent.addChild(obj);
      this.visitChildrenFromParent(ctx, obj);
    }
  }

  visit(ctx: ParseTree) {
    if (ctx.constructor.name !== "ArquivoContext") {
      throw new ParseError(
        "O algoritmo Portugol deve-se iniciar com um contexto de arquivo (palavra-chave 'programa')",
        ctx,
      );
    }

    const arquivo = new Arquivo(ctx as ArquivoContext);

    this.visitChildrenFromParent(ctx, arquivo);

    return arquivo;
  }
}
