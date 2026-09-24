# Histórico de atualizações

<!-- Mudanças que ainda estão só no beta ficam na seção `## BETA` do topo. Quando o beta chega na main, o deploy troca o título pela data do dia (se o dia já tiver uma seção, junta as duas separadas por `---`) e deixa uma seção `## BETA` vazia no lugar. -->

As mudanças mais recentes do Portugol Webstudio aparecem primeiro.

## BETA

O código agora é salvo automaticamente no navegador enquanto você digita:

- Se a aba do navegador for fechada sem querer, basta abrir o Portugol Webstudio de novo: as abas voltam como estavam
- Cada janela do navegador tem as suas próprias abas, sem uma sobrescrever o código da outra
- O código de outras janelas que foram fechadas pode ser restaurado ou descartado aqui na página inicial
- O código fica guardado só neste navegador: para levá-lo a outro computador, continue salvando o arquivo

## 24/09/2026

`Texto.substituir` agora copia o texto substituto exatamente como escrito, sem interpretar `$` como um caractere especial, como no Portugol Studio. Contribuição de [@kwy404](https://github.com/kwy404). [Mais detalhes](https://github.com/dgadelha/Portugol-Webstudio/pull/446)

## 14/09/2026

Correção de acesso a variáveis e leitura de valores durante a execução do código. [Mais detalhes](https://github.com/dgadelha/Portugol-Webstudio/issues/432)

## 10/09/2026

A verificação de erros foi reescrita para seguir a do Portugol Studio:

- As mensagens, posições e códigos de erro agora são os mesmos do Portugol Studio
- Um programa com erro **não é mais executado**: os erros aparecem no console, como no Portugol Studio
- Novos avisos de variável não utilizada, variável global ocultada e conversão de valor
- O editor avisa quando o programa usa uma biblioteca que o Webstudio ainda não executa
- Ao executar, o editor passa a marcar os erros do código que rodou, em vez de limpar as marcações

## 06/09/2026

Grande atualização de compatibilidade com o Portugol Studio. Alguns programas podem ter resultados diferentes de antes:

- Números reais aparecem com casa decimal: `escreva(1.0)` imprime `1.0`
- A divisão entre inteiros descarta as casas decimais: `7 / 2` dá `3`
- Vetores e matrizes começam preenchidos (`0`, `0.0`, `falso`) e guardam alterações feitas em funções
- O comando `leia` aceita mais formatos de número, como `.5`, `5.` e `1e3`
- Correções nas bibliotecas `Matematica`, `Texto`, `Tipos` e `Calendario`
- Nova biblioteca `Objetos`, para trabalhar com dados em JSON e XML

[Encontrou algum problema? Relate aqui](https://github.com/dgadelha/Portugol-Webstudio/issues/new?template=bug.yml)

## 11/04/2026

Correção na precedência de operadores aritméticos (`*`, `/`, `%`, `+`, `-`).

## 10/04/2026

Correção de erro de cache no carregamento da IDE causado pela última atualização.

## 30/03/2026

Melhorias no verificador de erros. [Relate qualquer problema aqui](https://github.com/dgadelha/Portugol-Webstudio/issues/new?template=bug.yml)

## 19/03/2026

Validação de tamanho em atribuição de valores na declaração de vetores e matrizes ([PR #369](https://github.com/dgadelha/Portugol-Webstudio/pull/369), contribuído por [@maikvinicius](https://github.com/maikvinicius))

## 18/02/2025

Documentação de Bibliotecas na seção Ajuda

## 09/02/2025

Refatoração/correção de variáveis por referência.

## 08/02/2025

Implementação da biblioteca `Graficos` e correção na execução de operações lógicas.

## 04/01/2025

Configurações de exibição do editor de código adicionadas, agora é possível alterar o tamanho da fonte e a quebra de linha. Nova opção para escolher o local de salvar o arquivo (somente no Chrome ou Edge). Melhorias na exibição de erros.

## 26/12/2024

Adicionado o tema claro e a tela de configurações para escolher o tema da IDE, mais configurações vindo em breve.

## 23/09/2024

Ajuste na fonte da seção Ajuda para estar disponível offline, mantendo uma boa experiência sem depender de conexão com a internet.

## 22/09/2024

Novo modo de salvar arquivos sem manter compatibilidade com o Portugol Studio. Alteração do comportamento de atualizações do PWA.

## 13/09/2024

Melhorias no controle de abas: diálogos próprios para confirmação de renomear e fechar abas. Ação **Salvar como** com opções avançadas para salvar o código.

## 26/07/2024

Melhorias na exibição de erros de compilação e correção de checagem de uso de função antes da declaração

## 24/07/2024

Correção nas funções `maior_numero` e `menor_numero` da biblioteca `Matematica`

## 02/05/2024

Portugol Webstudio como PWA: funcionamento offline

## 01/05/2024

Correção de retorno em função vazia

## 30/04/2024

- Melhorias de acessibilidade e ajustes na tela inicial e ícones
- Correção nas verificações de erros relacionados a escopo e tipos
- Melhorias na experiência de erros e de estabilidade no geral

## 10/03/2024

Otimização de desempenho na análise semântica

## 09/03/2024

Novo domínio: **portugol.dev** e experimento com propagandas

## 08/03/2024

Melhorias de performance na interface da plataforma

## 17/01/2024

Melhorias nas verificações de erros (comparação lógica e bibliotecas)

## 26/12/2023

Melhorias nas verificações de erros (escopos e tipos)

## 15/10/2023

Correção de verificação simples de retorno de função

## 11/10/2023

Correção de quebra de linha após execução da função `leia()`

## 28/09/2023

Correção de uso excessivo de recursos ao usar atribuições.

## 02/09/2023

Verificação básica de erros no editor.

## 10/08/2023

- Atualização de dependências.
- Colorir nome de funções ([PR #72](https://github.com/dgadelha/Portugol-Webstudio/pull/72), contribuído por [@6a8i](https://github.com/6a8i)).
- Melhorias na experiência de renomear e fechar abas. Correção na aplicação de modificadores em variáveis.

## 10/12/2022

Correção no comportamento da concatenação.

## 12/11/2022

Correção na verificação de tipos de argumentos de funções.

## 31/10/2022

Rolagem automática no Console de Saída e implementação dos operadores de atribuição composta (`+=`, `-=`, `/=` e `*=`).

## 30/10/2022

Correção de problema ao utilizar retornos de funções como valores.

## 27/10/2022

Correção na declaração de variáveis do tipo _vetor_ e correção na concatenação de _cadeia_ e _caracter_.

## 25/10/2022

Correção na inicialização de variáveis no laço _para_.

## 24/10/2022

Implementação das operações de _Bitwise Shift_ (_Left Shift_ e _Right Shift_) e correção nas operações de Bitwise _AND_, _OR_ e _XOR_.

## 20/10/2022

Correção na atribuição de valores às variáveis para garantir as tipagens corretas e correção na exibição de erros em tempo de execução.

## 19/10/2022

Correção ao pressionar _backspace_ e suporte a múltiplos parâmetros na entrada de dados pela função `leia`.

## 12/10/2022

Melhorias internas de componentização e organização de código.
