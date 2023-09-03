import { PortugolVisitor } from "@portugol-webstudio/antlr";
import { ParserRuleContext } from "antlr4ts";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor.js";
import { ParseTree } from "antlr4ts/tree/ParseTree.js";
import { RuleNode } from "antlr4ts/tree/RuleNode.js";

import { Bypass, UnhandledNode, Node, ContextNodeMap } from "./nodes/index.js";

export interface Empty {}

export class PortugolNode extends AbstractParseTreeVisitor<Empty> implements PortugolVisitor<Empty> {
  protected defaultResult(): Empty {
    return {};
  }

  protected aggregateResult(_aggregate: Empty, _nextResult: Empty): Empty {
    throw new Error("Shouldn't need to aggregate results");
  }

  visitChildrenArray(node: RuleNode): Node[] {
    const result: Array<Node | undefined> = [];
    const n = node.childCount;

    for (let i = 0; i < n; i++) {
      const c = node.getChild(i);
      const childResult = this.visit(c);

      // Vírgulas
      if (childResult instanceof UnhandledNode && childResult.type === "TerminalNode") {
        continue;
      }

      if (childResult instanceof Bypass) {
        result.push(...this.visitChildrenArray(childResult.ctx as RuleNode));
        continue;
      }

      result.push(childResult);
    }

    return result.map(x => x!);
  }

  visit(ctx: ParseTree) {
    const children = this.visitChildrenArray(ctx as RuleNode);
    const ctor = ContextNodeMap.get(ctx.constructor as new (...args: any[]) => ParserRuleContext);

    if (ctor) {
      return new ctor(ctx, children);
    }

    return new UnhandledNode(ctx, ctx.constructor.name, ctx.text, children);
  }
}
