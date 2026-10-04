import type { ExampleItem } from "./dialog-open-example.component";

/**
 * Formato do `exemplos/index.json` do `@portugol-webstudio/resources`
 */
export interface Exemplo {
  nome: string;
  arquivo?: string;
  descricao?: string;
  imagem?: string;
  itens?: Exemplo[];
  /**
   * `false` nos exemplos (ou pastas) que dependem do que o Webstudio ainda não
   * executa: as bibliotecas Teclado, Mouse, Sons, Arquivos e Internet, e as
   * funções de imagem e fonte da Graficos
   */
  suportado?: boolean;
}

/**
 * Converte o índice de exemplos para a árvore exibida no diálogo, sem os exemplos
 * não suportados e sem as pastas que ficarem vazias
 */
export function converterExemplos(exemplos: Exemplo[], pasta = ""): ExampleItem[] {
  return exemplos.flatMap<ExampleItem>(exemplo => {
    if (exemplo.suportado === false) {
      return [];
    }

    if (exemplo.itens) {
      const id = `${pasta}/${exemplo.nome}`;
      const children = converterExemplos(exemplo.itens, id);

      return children.length > 0 ? { id, name: exemplo.nome, type: "dir", children } : [];
    }

    const arquivo = exemplo.arquivo ?? "";

    return {
      id: arquivo,
      name: exemplo.nome,
      type: "file",
      file: arquivo,
      description: exemplo.descricao,
      hasImage: exemplo.imagem !== undefined,
      image: exemplo.imagem,
    };
  });
}
