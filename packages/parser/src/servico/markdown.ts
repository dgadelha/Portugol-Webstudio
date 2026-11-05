/**
 * O código num bloco colorido como Portugol, na documentação das sugestões e na informação.
 * A cerca tem uma crase a mais que a maior sequência de crases do código: uma constante
 * `cadeia` pode ter várias linhas, e uma linha só com três crases fecharia o bloco antes da hora,
 * deixando o resto do texto virar Markdown (links e imagens) na informação.
 */
export function bloco(código: string) {
  const maior = Math.max(2, ...(código.match(/`+/g) ?? []).map(crases => crases.length));
  const cerca = "`".repeat(maior + 1);

  return `${cerca}portugol\n${código}\n${cerca}`;
}

const CARACTERES_DO_MARKDOWN = /[\\`*_{}[\]()#+\-.!|<>~&]/g;

/**
 * O texto como foi escrito, e não Markdown: `a * b`, `v[i]` e `~~x~~` aparecem assim. Para os
 * comentários do programa e as mensagens de erro, que o editor mostra como Markdown.
 */
export function textoLiteral(texto: string) {
  return texto.replaceAll(CARACTERES_DO_MARKDOWN, String.raw`\$&`);
}

const ENDEREÇO = /https?:\/\/[^\s<>]+/g;

/**
 * Como `textoLiteral`, mas os endereços continuam links: escapados, eles mudariam
 * (`example\.com`). O destino vai entre `<` e `>`, onde o Markdown não lê nada; e no formato
 * `[texto](<destino>)`, e não `<destino>`, porque nesse o Monaco codifica o `&` duas vezes e o
 * link abre `?a=1&amp;b=2`.
 */
export function textoComLinks(texto: string) {
  let resultado = "";
  let desde = 0;

  for (const { 0: encontrado, index } of texto.matchAll(ENDEREÇO)) {
    const endereço = semPontuaçãoFinal(encontrado);

    resultado += `${textoLiteral(texto.slice(desde, index))}[${textoLiteral(endereço)}](<${endereço}>)`;
    desde = index + endereço.length;
  }

  return resultado + textoLiteral(texto.slice(desde));
}

/**
 * O ponto final da frase não é do endereço, e o `)` só é quando o endereço abriu um, como em
 * `https://pt.wikipedia.org/wiki/Pi_(constante)`.
 */
function semPontuaçãoFinal(endereço: string) {
  const abertos = contar(endereço, "(");
  let fechados = contar(endereço, ")");
  let fim = endereço.length;

  while (fim > 0) {
    const último = endereço[fim - 1];
    const parênteseSobrando = último === ")" && abertos < fechados;

    if (!parênteseSobrando && !".,;:!?'\"".includes(último)) {
      break;
    }

    if (último === ")") {
      fechados--;
    }

    fim--;
  }

  return endereço.slice(0, fim);
}

function contar(texto: string, caractere: string) {
  return texto.split(caractere).length - 1;
}
