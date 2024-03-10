import { PareContext } from "@portugol-webstudio/antlr";

import { Comando } from "./Comando.js";
import { Node } from "./Node.js";

export class PareCmd extends Comando<PareContext> {
  addChild(node: Node) {
    this.unexpectedChild(node);
  }
}
