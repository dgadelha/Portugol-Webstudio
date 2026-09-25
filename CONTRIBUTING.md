# Contribuindo com o Portugol Webstudio

Obrigado por querer contribuir com o Portugol Webstudio! Este guia mostra como preparar o ambiente, rodar a IDE e os testes, e o que fazer antes de abrir um pull request.

## Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js LTS](https://nodejs.org/pt-br/download/)
- [Java 25](https://learn.microsoft.com/pt-br/java/openjdk/download), só para rodar os testes

## Preparando o ambiente

1. Faça um fork do repositório e clone o seu fork:

   ```sh
   git clone https://github.com/<seu-usuario>/Portugol-Webstudio.git
   cd Portugol-Webstudio
   ```

2. Instale as dependências:

   ```sh
   npm ci
   ```

3. Compile os pacotes:

   ```sh
   npm run build
   ```

## Rodando a IDE

Inicie o servidor de desenvolvimento:

```sh
npm start
```

A IDE fica disponível em [http://localhost:4200](http://localhost:4200).

Se você for mexer nos pacotes da pasta `packages` (parser, runtime, runner, worker…), deixe também, em outro terminal, a compilação deles rodando em modo de observação:

```sh
npm run build:w
```

Assim, cada alteração nos pacotes é recompilada e a IDE passa a usar o código atualizado.

## Rodando os testes

Na primeira vez, prepare os testes. Isso baixa os programas de referência do Portugol Studio, com os quais a saída do Webstudio é comparada:

```sh
npm run test:setup -w @portugol-webstudio/runner
```

Depois, rode os testes:

```sh
npm test
```

## Antes de abrir o pull request

1. Confira se o código passa nas mesmas verificações do CI:

   ```sh
   npm run lint
   npm run typecheck
   npm run format:check
   ```

   Para corrigir a formatação automaticamente, use `npm run format`.

2. Registre a sua mudança no [`CHANGELOG.md`](CHANGELOG.md): escreva na seção `## BETA` do topo, pensando em quem usa a IDE (estudantes e professores), sem jargão técnico. Se a seção já tiver outras mudanças, coloque a sua no topo dela e separe da anterior com uma linha `---`. Não troque `BETA` por uma data: isso é feito automaticamente quando a versão beta chega na versão estável.

3. Abra o pull request para a branch **`beta`**. As mudanças passam primeiro pela versão beta ([beta.portugol.dev](https://beta.portugol.dev/)) antes de chegarem a todos em [portugol.dev](https://portugol.dev/).
