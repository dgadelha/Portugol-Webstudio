# O editor de código

Cada programa fica numa aba de código. Ela tem a barra de ações à esquerda, o editor no meio e, embaixo, o painel com a **Saída**, os **Problemas** e as **Variáveis**.

![Uma aba de código com o programa executado](../../recursos/imagens/light/webstudio/primeiro-programa@2x.webp)

## A barra de ações

![A barra de ações, com os botões de executar, parar, depurar, abrir, salvar, compartilhar, exemplos, ajuda e configurações](../../recursos/imagens/light/webstudio/barra-de-acoes@2x.webp)

De cima para baixo:

| Botão                   | O que faz                                                                    | Atalho       |
| ----------------------- | ---------------------------------------------------------------------------- | ------------ |
| **Executar**            | Executa o programa (veja [Executando programas](executando.md))              | Ctrl + Enter |
| **Parar**               | Interrompe o programa que está executando                                    | Shift + F5   |
| **Depurar**             | Executa passo a passo (veja [Executando passo a passo](depurando.md))        | Alt + P      |
| **Abrir arquivo**       | Abre arquivos `.por` do computador, cada um numa aba nova                    | Ctrl + O     |
| **Salvar**              | Baixa o código como um arquivo `.por`                                        | Ctrl + S     |
| **Salvar como…**        | Mostra outras formas de salvar (veja [Abas e arquivos](abas_e_arquivos.md))  |              |
| **Compartilhar código** | Gera um link para o código (veja [Compartilhando código](compartilhando.md)) |              |
| **Abrir exemplo**       | Abre a lista de [exemplos](exemplos.md)                                      |              |
| **Ajuda**               | Abre a Ajuda                                                                 | F1           |
| **Configurações**       | Abre as [configurações](configuracoes.md)                                    |              |

Passe o mouse sobre um botão, ou chegue nele pelo teclado, para ver o nome e o atalho.

## Escrevendo o código

O editor ajuda enquanto você escreve:

- **Cores**: palavras como `programa`, `se` e `inteiro`, textos, números e comentários ganham cores diferentes, o que ajuda a perceber uma aspa ou um comentário que ficou aberto.
- **Sugestões**: enquanto você digita, aparece uma lista com o que pode ser escrito ali: as variáveis e funções do programa, com o tipo de cada uma, as funções da linguagem, como `escreva` e `leia`, as palavras da linguagem e as estruturas, como `se` e `para`. Escolha uma com as setas e aperte **Enter** ou **Tab**. Para abrir a lista a qualquer momento, aperte **Ctrl + Espaço**; com a lista aberta, o mesmo atalho mostra ou esconde a explicação da sugestão escolhida.
  - Depois do nome de uma biblioteca incluída e de um ponto, como em `mat.`, a lista mostra as funções e constantes dela, com a explicação de cada uma.
  - Uma função entra com os parênteses, e uma estrutura entra completa, com as chaves. Os trechos a preencher, como a condição de um `se`, ficam marcados: escreva o primeiro e aperte **Tab** para ir ao próximo.
- **Parâmetros**: ao abrir o parêntese de uma função, aparece o que ela recebe, com o parâmetro que você está escrevendo destacado e a explicação dele. Para ver de novo, aperte **Ctrl + Shift + Espaço**.
- **Informações**: parando o mouse sobre um nome, aparece o que ele é. Numa variável, a declaração, se ela é local ou global e o comentário escrito logo acima dela ou no fim da linha dela; numa função do programa, o que ela recebe e devolve; numa função ou constante de biblioteca, a explicação, com o link **Ver na Ajuda**, que abre a página dela. Pelo teclado, com o cursor no nome, aperte **Ctrl + K** e depois **Ctrl + I**; apertando de novo, o foco vai para a informação.
- **Ir para a declaração**: **F12** (ou **Ctrl + F12**, nos navegadores em que o F12 abre as ferramentas do desenvolvedor), ou **Ctrl + clique** no nome, leva o cursor até onde a variável, a constante, a função ou o apelido da biblioteca foi declarado. No nome de uma biblioteca, numa função ou constante dela, como `mat.potencia`, e no `escreva`, no `leia` e no `limpa`, que não são declarados no programa, abre a página deles na aba de Ajuda. Com o **Ctrl** apertado, o nome que leva a uma declaração fica sublinhado. O mesmo está no menu do botão direito, em **Go to Definition**. Já o **Alt + F12** (no Linux, **Ctrl + Shift + F10**) mostra a declaração numa janela dentro do próprio código, sem sair dele; numa função de biblioteca, a explicação e o que ela recebe e devolve. **Esc** fecha essa janela.
- **Fechamento automático**: ao abrir chaves, parênteses ou aspas, o fechamento já aparece.
- **Pares de chaves**: cada nível de chaves e parênteses ganha uma cor, e as linhas verticais ligam o começo e o fim de cada bloco.
- **Recolher blocos**: as setas na margem, ao lado dos números das linhas, escondem e mostram o conteúdo de uma função ou de um bloco. Também dá para criar um bloco recolhível com os comentários `// regiao` e `// fimregiao` (veja abaixo).
- **Bloco fixo no topo**: ao rolar um programa grande, a linha de início da função e dos blocos em que o cursor está fica visível no alto do editor.
- **Minimapa**: à direita, uma miniatura do código mostra onde você está no programa. No celular, ele fica escondido.

Todos esses recursos podem ser ligados e desligados nas [configurações](configuracoes.md).

### Blocos recolhíveis com comentários

Para recolher um trecho qualquer do programa, como a parte que lê os dados, marque o começo com `// regiao` e o fim com `// fimregiao`. Uma seta aparece na margem, ao lado do comentário de começo, e o texto depois de `regiao` fica visível com o trecho recolhido:

```portugol sintaxe title="Um trecho recolhível"
// regiao Leitura dos dados
escreva("Qual é o seu nome? ")
leia(nome)
escreva("Qual é a sua idade? ")
leia(idade)
// fimregiao
```

Também valem `// região`, `// fim regiao` e `// fim região`, e os `// region` e `// endregion` do Visual Studio Code.

## Erros, avisos e informações

O Portugol Webstudio confere o código meio segundo depois que você para de digitar. O que ele encontra aparece de três formas:

- **Sublinhado no código**: vermelho para erros, amarelo para avisos e azul para informações. Passe o mouse sobre o trecho sublinhado para ler a mensagem.
- **Na aba Problemas**, no painel de baixo: a lista de tudo o que foi encontrado, com os erros primeiro, cada um com a linha e a coluna. Clique num problema para levar o cursor até ele.
- **Na barra de status**, embaixo à esquerda: a quantidade de erros e de avisos. Clique nela para abrir a aba Problemas.

![Um erro sublinhado no código e listado na aba Problemas](../../recursos/imagens/light/webstudio/erros-no-editor@2x.webp)

Um **erro** impede o programa de ser executado: ao clicar em Executar, o programa não começa, e o painel abre na aba Problemas. Um **aviso** aponta algo que provavelmente está errado, mas o programa executa assim mesmo. Uma **informação** é uma dica, como uma variável que foi declarada e nunca usada.

Se preferir que os erros só apareçam ao executar, desligue **Mostrar erros enquanto digita** nas [configurações](configuracoes.md).

As mensagens de erro seguem as do Portugol Studio, com algumas melhorias. Veja [Diferenças em relação ao Portugol Studio](diferencas_portugol_studio.md).

## A barra de status

A barra no rodapé mostra informações sobre a aba de código aberta:

![A barra de status, com a quantidade de erros e avisos, a posição do cursor, a indentação e a linguagem](../../recursos/imagens/light/webstudio/barra-de-status@2x.webp)

- **Erros e avisos**: clique para abrir a aba Problemas.
- **Executando** ou **Aguardando entrada**: aparece enquanto o programa executa.
- **Ln e Col**: a linha e a coluna do cursor. Clique, ou aperte **Ctrl + G**, para ir até uma linha.
- **Espaços** ou **Tabulação**: como o código é indentado. Clique para mudar nas configurações.
- **Portugol**: a linguagem do editor.

## Outros recursos do editor

O editor é o mesmo do Visual Studio Code, e muitos dos atalhos dele também funcionam, como **Ctrl + F** para procurar, **Ctrl + H** para substituir, **Ctrl + /** para comentar e descomentar linhas e **Alt + seta para cima/baixo** para mover uma linha. Veja a lista em [Atalhos de teclado](atalhos.md).

### Para curiosos: o código gerado

Para executar, o Portugol Webstudio traduz o programa para JavaScript, a linguagem dos navegadores. Na borda direita do editor há uma divisória fina: arraste-a para a esquerda para ver o código JavaScript gerado. Ele é só para leitura.
