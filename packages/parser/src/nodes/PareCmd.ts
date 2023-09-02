import { PareContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Node } from "./Node.js";
import { invariant } from "../helpers/nodes.js";

export class PareCmd extends Comando {
  constructor(
    public ctx: PareContext,
    public children: Node[],
  ) {
    super(ctx, children);

    invariant(ctx.text === "pare", ctx);

    for (const child of children) {
      this.unexpectedChild(child);
    }
  }
}
