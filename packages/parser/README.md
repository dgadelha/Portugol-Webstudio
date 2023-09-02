# `@portugol-webstudio/parser`

Este pacote contém a implementação do parser de Portugol, que recebe uma árvore sintática gerada pelo [ANTLR](https://www.antlr.org/) e a transforma em nós de uma árvore de sintaxe abstrata (AST).

## Estrutura

O parser é exposto através da classe `PortugolNode`, que recebe uma árvore pré-processada pelo [ANTLR](https://www.antlr.org/). A árvore de sintaxe abstrata é representada pela classe `Arquivo`, que contém os nós da árvore.

## Exemplo de uso:

```typescript
import { PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import { PortugolNode } from "@portugol-webstudio/runtime";
import { CharStreams, CommonTokenStream } from "antlr4ts";

const code = `programa {
  funcao inicio() {
    escreva("Olá mundo!")
  }
}`;

const inputStream = CharStreams.fromString(code);
const lexer = new PortugolLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new PortugolParser(tokenStream);
const tree = parser.arquivo();

const arquivo = new PortugolNode().visit(tree);

arquivo.funções[0].instruções[0].argumentos[0].valor; // "Olá mundo!"
```
