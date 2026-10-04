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
}

/**
 * Exemplos que dependem do que o Webstudio ainda não executa: as bibliotecas
 * Teclado, Mouse, Sons, Arquivos e Internet, e as funções de imagem e fonte da
 * Graficos. Os jogos e a música usam o teclado ou o mouse; em Gráficos e
 * Calendário, só os exemplos originais que usam esses recursos ficam de fora.
 */
const EXEMPLOS_IGNORADOS = [
  /^bibliotecas\/(sons|mouse|teclado|internet|arquivos)\//,
  /^bibliotecas\/graficos\/(onda|senoides|solar|salvar_imagem|sphere|fractal_fern|paint|qr_code)\.por$/,
  /^bibliotecas\/calendario\/(relogio_analogico|relogio_digital)\.por$/,
  /^jogos\//,
  /^musica\//,
];

/**
 * Converte o índice de exemplos para a árvore exibida no diálogo, sem os exemplos
 * ignorados e sem as pastas que ficarem vazias
 */
export function converterExemplos(exemplos: Exemplo[], pasta = ""): ExampleItem[] {
  return exemplos.flatMap<ExampleItem>(exemplo => {
    if (exemplo.itens) {
      const id = `${pasta}/${exemplo.nome}`;
      const children = converterExemplos(exemplo.itens, id);

      return children.length > 0 ? [{ id, name: exemplo.nome, type: "dir", children }] : [];
    }

    const arquivo = exemplo.arquivo ?? "";

    if (EXEMPLOS_IGNORADOS.some(regex => regex.test(arquivo))) {
      return [];
    }

    return [
      {
        id: arquivo,
        name: exemplo.nome,
        type: "file",
        file: arquivo,
        description: exemplo.descricao,
        hasImage: exemplo.imagem !== undefined,
        image: exemplo.imagem,
      },
    ];
  });
}
