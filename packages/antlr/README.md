# `@portugol-webstudio/antlr`

Este pacote contém os recursos gerados pelo [antlr-ng](https://github.com/antlr-ng/antlr-ng) para a [gramática do Portugol](https://github.com/UNIVALI-LITE/Portugol-Studio/blob/master/core/src/main/antlr/Portugol.g4).

## Atualizando a gramática

Para atualizar a gramática, basta executar o comando abaixo:

```sh
npm run antlr-update
npm run antlr-ng
```

O `antlr-update` baixa a gramática do Portugol Studio e aplica as mudanças do Webstudio, que ficam em `src/sintatico.patch` e `src/lexico.patch`.

Os arquivos gerados serão salvos na pasta `src`, dentre eles:

- `PortugolLexer.ts`: contém a implementação do analisador léxico
- `PortugolParser.ts`: contém a implementação do analisador sintático
- `PortugolVisitor.ts`: contém a implementação do visitor
- `PortugolListener.ts`: contém a implementação do listener

O `PortugolErrorListener.ts` não é gerado: ele tem os tipos dos diagnósticos (`PortugolCodeDiagnostic`), usados pelo verificador do pacote `@portugol-webstudio/parser`.

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
