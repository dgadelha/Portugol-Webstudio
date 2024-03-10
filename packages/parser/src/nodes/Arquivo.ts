import { ArquivoContext } from "@portugol-webstudio/antlr";

import { DeclaraçãoCmd } from "./DeclaraçãoCmd.js";
import { Função } from "./Função.js";
import { InclusãoBiblioteca } from "./InclusãoBiblioteca.js";
import { Node } from "./Node.js";

export class Arquivo extends Node<ArquivoContext> {
  bibliotecas: InclusãoBiblioteca[] = [];
  declarações: DeclaraçãoCmd[] = [];
  funções: Função[] = [];

  addChild(child: Node) {
    if (child instanceof Função) {
      this.funções.push(child);
    } else if (child instanceof InclusãoBiblioteca) {
      this.bibliotecas.push(child);
    } else if (child instanceof DeclaraçãoCmd) {
      this.declarações.push(child);
    } else {
      this.unexpectedChild(child);
    }

    this.children.push(child);
  }
}
