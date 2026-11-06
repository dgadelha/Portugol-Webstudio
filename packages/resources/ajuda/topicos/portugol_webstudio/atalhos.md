# Atalhos de teclado

Tudo no Portugol Webstudio pode ser feito pelo teclado. Ao passar o mouse sobre um botão, ou chegar nele com o **Tab**, a dica mostra o atalho dele.

No Mac, com o cursor no código, o **Option** digita caracteres, como o til do "ã" (**Option + N**) e o "ç" (**Option + C**): ali, o **Option + N** e o **Option + W** não abrem nem fecham abas, e os atalhos da depuração só valem com o programa já sendo depurado, quando o código não pode ser editado. Fora do editor, todos funcionam. O **Home** e o **End** são **Fn + seta para a esquerda** e **Fn + seta para a direita**.

Em alguns notebooks, e na maioria dos Macs, as teclas de função, como o **F1** e o **F5**, só funcionam junto com o **Fn**.

## Em qualquer lugar

| Windows e Linux | macOS      | O que faz                   |
| --------------- | ---------- | --------------------------- |
| Alt + N         | Option + N | Abre uma aba de código nova |
| Alt + W         | Option + W | Fecha a aba aberta          |

## Numa aba de código

| Windows e Linux                                          | macOS                         | O que faz                                                          |
| -------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| Ctrl + Enter                                             | Cmd + Enter                   | Executa o programa                                                 |
| Ctrl + Shift + Enter                                     | Cmd + Shift + Enter           | Num [exercício](exercicios.md), confere o programa (**Verificar**) |
| Alt + P                                                  | Option + P                    | Executa o programa passo a passo                                   |
| Shift + F5                                               | Shift + F5                    | Para o programa, ou a conferência de um exercício                  |
| Ctrl + S                                                 | Cmd + S                       | Baixa o código como um arquivo `.por`                              |
| Ctrl + O                                                 | Cmd + O                       | Abre um arquivo do computador                                      |
| F1                                                       | F1                            | Abre a Ajuda                                                       |
| Ctrl + G                                                 | Ctrl + G                      | Vai até uma linha                                                  |
| Ctrl + Espaço                                            | Ctrl + Espaço ou Option + Esc | Abre a lista de sugestões                                          |
| Ctrl + Shift + Espaço                                    | Cmd + Shift + Espaço          | Mostra os parâmetros da função em que o cursor está                |
| Ctrl + K, Ctrl + I                                       | Cmd + K, Cmd + I              | Mostra o que é o nome em que o cursor está; de novo, foca o texto  |
| F12 ou Ctrl + F12                                        | F12 ou Cmd + F12              | Vai até a declaração do nome no cursor, ou à página dele na Ajuda  |
| Ctrl + clique                                            | Cmd + clique                  | Vai até a declaração do nome clicado, ou à página dele na Ajuda    |
| Alt + F12 (no Linux e no Chromebook, Ctrl + Shift + F10) | Option + F12                  | Mostra a declaração do nome no cursor numa janela dentro do código |

## Na criação de exercícios

Numa aba de [criação de exercício](criando_exercicios.md):

| Windows e Linux     | macOS             | O que faz                                                                                |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| Ctrl + B / Ctrl + I | Cmd + B / Cmd + I | No enunciado, deixa o texto selecionado em negrito ou em itálico                         |
| Ctrl + M            | Ctrl + Shift + M  | Num editor de código, faz o **Tab** ir ao próximo campo em vez de escrever uma tabulação |

## Executando passo a passo

Com o programa pausado na depuração (veja [Executando passo a passo](depurando.md)):

| Windows e Linux | macOS      | O que faz                           |
| --------------- | ---------- | ----------------------------------- |
| Alt + P         | Option + P | Próximo passo, entrando nas funções |

Com a **Depuração avançada** ligada nas [configurações](configuracoes.md):

| Windows e Linux | macOS      | O que faz                                                   |
| --------------- | ---------- | ----------------------------------------------------------- |
| Alt + J         | Option + J | Pula função: executa as funções da linha sem entrar nelas   |
| Alt + R         | Option + R | Sai da função e para em quem a chamou                       |
| Alt + C         | Option + C | Continua até o próximo ponto de parada, ou pausa o programa |
| Alt + M         | Option + M | Marca ou desmarca um ponto de parada na linha do cursor     |

## Escrevendo código

O editor é o mesmo do Visual Studio Code, e os atalhos dele funcionam. Alguns dos mais úteis:

| Windows e Linux                                                                                | macOS                            | O que faz                                    |
| ---------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------- |
| Ctrl + F                                                                                       | Cmd + F                          | Procura no código                            |
| Ctrl + H                                                                                       | Cmd + Option + F                 | Procura e substitui                          |
| Ctrl + /                                                                                       | Cmd + /                          | Comenta ou descomenta as linhas selecionadas |
| Ctrl + Z / Ctrl + Y                                                                            | Cmd + Z / Cmd + Shift + Z        | Desfaz e refaz                               |
| Ctrl + D                                                                                       | Cmd + D                          | Seleciona a próxima ocorrência da palavra    |
| Alt + seta para cima/baixo                                                                     | Option + seta para cima/baixo    | Move a linha para cima ou para baixo         |
| Shift + Alt + seta para baixo (no Linux e no Chromebook, Ctrl + Shift + Alt + seta para baixo) | Shift + Option + seta para baixo | Copia a linha para baixo                     |
| Tab / Shift + Tab                                                                              | Tab / Shift + Tab                | Aumenta ou diminui a indentação das linhas   |

## Nas abas

Com uma aba selecionada (clique nela, ou chegue nela com o **Tab**):

| Windows e Linux              | macOS                             | O que faz                           |
| ---------------------------- | --------------------------------- | ----------------------------------- |
| Seta para a esquerda/direita | Seta para a esquerda/direita      | Vai para a aba ao lado              |
| Home / End                   | Fn + seta para a esquerda/direita | Vai para a primeira ou a última aba |
| F2                           | F2                                | Renomeia a aba                      |
| Delete                       | Delete                            | Fecha a aba                         |

Com o mouse, um duplo clique renomeia a aba e um clique com o botão do meio fecha.

## Nas listas e janelas

| Onde                      | Atalho                       | O que faz                                                                                       |
| ------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| Barra de ações            | Setas, Home e End            | Andam entre os botões                                                                           |
| Painel de baixo           | Seta para a esquerda/direita | Troca entre Saída, Problemas e Variáveis                                                        |
| Exemplos                  | Setas, Home, End e Enter     | Escolhem e abrem um exemplo                                                                     |
| Exercícios                | Setas, Home, End e Enter     | Escolhem e abrem um exercício                                                                   |
| Lista de tópicos da Ajuda | Setas, Home, End e Enter     | Andam entre os tópicos e abrem um deles. Digitar uma letra vai para o tópico que começa com ela |
| Janela de gráficos        | Esc                          | Fecha a janela e para o programa                                                                |
| Qualquer janela           | Esc                          | Fecha a janela                                                                                  |
