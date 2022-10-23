# `@portugol-webstudio/resources`

Este pacote contém os recursos de ajuda e exemplos originados do [Portugol Studio](https://github.com/UNIVALI-LITE/Portugol-Studio), ajustados (quando necessário) para o Portugol Webstudio.

## Etapas de ajustes

Com base no script principal, `src/atualizar.ts`, os seguintes passos são executados:

1. O código do repositório do Portugol Studio é baixado.
2. O conteúdo da pasta `ide/src/main/assets/` é utilizado como base.
3. É gerado o índice da aba "Ajuda" no formato JSON, para facilitar o uso no front-end.
4. Os arquivos HTML de ajuda têm os seus estilos ajustados para melhor exibição e as substituições especiais do Portugol Studio são aplicadas.
5. Os arquivos POR de exemplo são recodificados de ISO-8859-1 para UTF-8, e o comentário gerado pelo Portugol Studio é removido.
6. É gerado o índice da aba "Exemplos" com base no índice em XML do Portugol Studio.

Os arquivos ajustados são armazenados na pasta `assets/`.
