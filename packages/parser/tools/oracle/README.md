# Oracle do Portugol Studio

O analisador semântico do [Portugol Studio](https://github.com/UNIVALI-LITE/Portugol-Studio) é a
**fonte da verdade** do checker deste pacote: quando divergimos dele, é porque estamos errados.
Este diretório roda o analisador original (em Java) para responder perguntas do tipo "o Portugol
Studio reclama disso?" e para gerar os artefatos versionados que o checker consome.

## Onde a ferramenta mora

O analisador de linha de comando **não vive aqui**: ele é o subprojeto `analisador` do Portugol
Studio (`br.univali.portugol.Analisador`), irmão do `portugol-console`. Isso mantém a ferramenta
versionada junto do núcleo que ela expõe — o oracle precisa casar exatamente com a versão do
`portugol-core` que estamos espelhando. Aqui só existe o invólucro (`run.sh`).

## Pré-requisitos

- `java` no `PATH` (não é preciso JDK: nada é compilado aqui).
- Os JARs do Portugol Studio em `packages/runner/tests/assets`, incluindo
  `portugol-analisador-*.jar` — eles vêm do `portugol.tar` publicado no release.

Esse diretório é **gitignored** e não vem no clone. Para baixá-lo, rode na raiz do repositório:

```sh
npm run test:setup -w @portugol-webstudio/runner
```

O `run.sh` avisa e sai com erro se algo faltar. Para usar outra instalação do Portugol Studio,
aponte `PORTUGOL_ASSETS_DIR` para o diretório que contém os jars e o `lib/`.

## Ferramentas

### `run.sh`

Invólucro fino sobre o `portugol-analisador`.

```sh
# analisa arquivos
./run.sh ../../../resources/assets/exemplos/jogos/arkanoid.por

# analisa um programa vindo do stdin (o modo mais útil no dia a dia)
echo 'programa { funcao inicio() { inteiro a  a = b } }' | ./run.sh

# despeja os metadados das 13 bibliotecas em JSON
./run.sh --bibliotecas

# regera tests/fixtures/portugol-studio.golden.txt
./run.sh --golden
```

Cada diagnóstico sai numa linha:

```
TIPO|LINHA|COLUNA|CODIGO|MENSAGEM
```

com `TIPO` ∈ `ERRO`, `AVISO`, `FATAL`. `|`, quebras de linha e tabulações são removidos da
mensagem para manter uma linha por diagnóstico. Ao analisar arquivos, cada um é precedido de uma
linha `### <caminho>` — inclusive os que não produzem nenhum diagnóstico.

### `../corpus.mjs`

Do outro lado da comparação: roda o **nosso** analisador sobre os mesmos 119 exemplos.

```sh
npm run build -w @portugol-webstudio/antlr
npm run build -w @portugol-webstudio/parser
node packages/parser/tools/corpus.mjs               # resumo + um erro por linha
node packages/parser/tools/corpus.mjs --diferencial # compara com o golden
```

`--diferencial` usa `tests/fixtures/portugol-studio.golden.txt` (não precisa de Java) e reporta
**falso positivo** — erro nosso numa linha em que o Portugol Studio não acusa nada — e falso
negativo. Falso positivo é o que importa: como no Portugol Studio, o `PortugolExecutor` recusa
executar um programa com erro de compilação e lista os erros na saída — então um erro inventado
nosso impede de rodar um programa que funciona.

### `--bibliotecas`

Despeja os metadados das 13 bibliotecas em JSON, direto do `GerenciadorBibliotecas`.

**Não é a fonte dos metadados que o checker usa** — essa é o pacote
[`@portugol-recursos/bibliotecas`](https://github.com/portugol-webstudio/portugol-recursos), que é
mantido à mão, tem descrição de cada símbolo e já alimenta a Ajuda do IDE. O dump aqui serve para
_conferir_ aquele pacote contra o Java e detectar deriva: foi assim que se descobriu que
`Graficos.definir_tamanho_texto` estava tipado como `inteiro` sendo `double` no Java, e que seis
constantes de cor estavam em RGB em vez do ARGB assinado que o runtime usa.

Uma diferença que o schema do recursos não representa: o Java tem `modoAcesso`
(`POR_VALOR`/`POR_REFERENCIA`) por parâmetro. Ele é **derivado** de `dimensão` em
`src/bibliotecas/metadados.ts`, porque nas 13 bibliotecas "é por referência" e "tem dimensão"
coincidem nas duas direções, sem exceção — é a semântica do Portugol, não uma escolha por função.

### `../gerar-suporte.mjs`

Gera `packages/parser/src/bibliotecas/suporte.gerado.ts`, cruzando o que a linguagem tem
(`@portugol-recursos/bibliotecas`) com o que o runtime do Webstudio sabe executar
(`packages/runtime/src/libs`). É o que alimenta as verificações #47 e #48.

```sh
# a partir da raiz do repositório
node packages/parser/tools/gerar-suporte.mjs

# só confere se o arquivo versionado está atualizado (sai com 1 se não estiver)
node packages/parser/tools/gerar-suporte.mjs --check
```

Para descobrir o que o runtime implementa, o gerador **avalia** as bibliotecas de
`packages/runtime/src/libs/*.ts` — que são strings de JavaScript — com um `PortugolVar` de mentira
e lê as chaves do objeto resultante. Analisar essas strings com expressão regular é traiçoeiro
(métodos de objeto literal e constantes `NOME: new PortugolVar(...)` se confundem), e avaliar dá o
conjunto exato.

O parser **não** depende do pacote `runtime` em tempo de execução: o resultado da comparação é
gravado no código gerado.

## Artefatos versionados

| Artefato                                                    | Como regerar                                   |
| ----------------------------------------------------------- | ---------------------------------------------- |
| `packages/parser/tests/fixtures/portugol-studio.golden.txt` | `./run.sh --golden`                            |
| `packages/parser/src/bibliotecas/suporte.gerado.ts`         | `node packages/parser/tools/gerar-suporte.mjs` |

### A fixture `portugol-studio.golden.txt`

É a saída do `portugol-analisador` para os 119 exemplos de `packages/resources/assets/exemplos/**/*.por`,
com o caminho relativo a esse diretório (sem `./`) e em ordem alfabética estável (`LC_ALL=C`).
Existe para que o teste diferencial compare nossos diagnósticos com os do Portugol Studio **sem
precisar de Java** em CI ou no clone de quem for mexer no checker.

O corpus em si **não** é versionado: `packages/resources/assets/` é gitignored e baixado do
`master` do Portugol Studio por `npm run build -w @portugol-webstudio/resources`. Como vem do
`master`, ele pode mudar sem aviso — por isso a fixture é versionada e os testes que dependem do
corpus precisam tolerar a ausência do diretório.

Regere-a quando o corpus de exemplos ou a versão do `portugol-core` mudar — e leia o diff: cada
linha que aparece ou some é uma mudança de comportamento do analisador de referência.

No estado atual (`portugol-core-2.7.5`) ela contém, dos 119 exemplos:

- 2 erros de sintaxe, ambos em arquivos quebrados no próprio upstream
  (`bibliotecas/tipos/logico.por` e `jogos/arkanoid.por`);
- 509 `AvisoValorExpressaoSeraConvertido`, 13 `AvisoSimboloGlobalOcultado` e
  2 `AvisoVetorPodeSerVariavel`.

Ou seja: **117 dos 119 exemplos não têm erro nenhum**, e é isso que o checker precisa reproduzir.
