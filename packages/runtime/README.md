# `@portugol-webstudio/runtime`

Este pacote contém a implementação do transpilador de Portugol para JavaScript.

## Estrutura

O transpilador é exposto através da classe `PortugolJs`, e o código transpilado depende de um conjunto de funções auxiliares que são exportadas pela string `PortugolJsRuntime`.

## Exemplo de uso:

```typescript
import { PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import { PortugolJs } from "@portugol-webstudio/runtime";
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

const jsCode = new PortugolJs().visit(tree);
```

Exemplo de código transpilado pelo código acima:

```javascript
(async (initScope) => {
  const runtime = new PortugolRuntime(initScope);

  self.runtime = runtime;

  runtime.declareFunction("inicio", async (...args) => {
    let scope = runtime.getScope(runtime.globalScope);


    await runtime.callFunction(
      "escreva",
      "",
      [
        new PortugolVar("cadeia", "Olá mundo!"),
      ]
    );

  });

  await runtime.callFunction("inicio");
})
```
