# `@portugol-webstudio/antlr`

Este pacote contém os recursos gerados pelo [antlr4ng](https://github.com/mike-lischke/antlr4ng) para a [gramática do Portugol](https://github.com/UNIVALI-LITE/Portugol-Studio/blob/master/core/src/main/antlr/Portugol.g4).

## Atualizando a gramática

Para atualizar a gramática, basta executar o comando abaixo:

```sh
npm run antlr-update
npm run antlr4ng
```

Os arquivos gerados serão salvos na pasta `src`, dentre eles:

- `PortugolErrorListener.ts`: contém um `ANTLRErrorListener` que armazena os erros em memória
- `PortugolLexer.ts`: contém a implementação do analisador léxico
- `PortugolParser.ts`: contém a implementação do analisador sintático
- `PortugolVisitor.ts`: contém a implementação do visitor
- `PortugolListener.ts`: contém a implementação do listener

## Uso

```ts
import { PortugolLexer, PortugolParser } from "@portugol-webstudio/antlr";
import { CharStream, CommonTokenStream } from "antlr4ng";

const code = 'programa { funcao inicio() { escreva("Hello World!") } }';
const inputStream = CharStream.fromString(code);
const lexer = new PortugolLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new PortugolParser(tokenStream);
const tree = parser.arquivo();
//    ^^^^^^^^^^^^^^^^^^^^^^^^
```
