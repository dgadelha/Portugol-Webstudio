import { ParseTree } from "antlr4ng";

import { ParseError } from "./ParseError.js";
import { Node } from "../nodes/index.js";

export function getAllChildrenFromContext(ctx: ParseTree | null) {
  if (!ctx) {
    return [];
  }

  const children: ParseTree[] = [];

  for (let i = 0; i < ctx.getChildCount(); i++) {
    const child = ctx.getChild(i);

    children.push(child!, ...getAllChildrenFromContext(child));
  }

  return children;
}

export function getAllChildrenFromNode(node: Node): Node[] {
  return node.children.flatMap(child => [child, ...getAllChildrenFromNode(child)]);
}

export function invariant(condition: any, ctx: ParseTree, message?: string): asserts condition {
  if (condition) {
    return;
  }

  throw new ParseError(message ?? "Expressão inválida", ctx);
}
