export interface TreeItem {
  id: string;
  text: string;
  /**
   * Conteúdo em Markdown: nos tópicos da Ajuda, carregado ao abrir o item; nas
   * bibliotecas, gerado dos metadados
   */
  source?: string;
  /**
   * Caminho do arquivo Markdown do tópico, relativo à raiz da Ajuda. Nas
   * bibliotecas, o caminho só existe na árvore, para os links e o `#ajuda=`.
   */
  arquivo?: string;
  children?: TreeItem[];
}

/**
 * Formato do `topicos.json` da Ajuda (portugol-recursos)
 */
export interface AjudaTopico {
  titulo: string;
  arquivo: string;
  subtopicos?: AjudaTopico[];
}
