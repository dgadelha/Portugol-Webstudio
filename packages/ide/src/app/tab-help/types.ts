export interface TreeItem {
  id: string;
  text: string;
  /**
   * Conteúdo em Markdown; nos tópicos da Ajuda é carregado ao abrir o item
   */
  source?: string;
  /**
   * Caminho do arquivo Markdown do tópico, relativo à raiz da Ajuda
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
