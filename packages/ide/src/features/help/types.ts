export interface HelpTopic {
  id: string;
  text: string;
  /**
   * Página HTML em `assets/recursos/ajuda/`.
   */
  href?: string;
  /**
   * Conteúdo em Markdown, para os tópicos gerados aqui (bibliotecas).
   */
  source?: string;
  children?: HelpTopic[];
  kind?: "href" | "markdown";
}
