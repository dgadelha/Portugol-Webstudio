/**
 * Este exemplo demonstra como utilizar a função "obter_texto" da biblioteca "Internet"
 * para obter o conteúdo de uma página web. O conteúdo de uma página é um texto em HTML,
 * e o exemplo usa a biblioteca "Texto" para encontrar o título da página, que fica entre
 * as marcas <title> e </title>.
 *
 * A página usada, https://example.com, é mantida justamente para ser usada em exemplos.
 */

programa {
  inclua biblioteca Internet --> web
  inclua biblioteca Texto --> t

  cadeia endereco = "https://example.com"

  funcao inicio() {
    se (nao web.endereco_disponivel(endereco)) {
      escreva("Não foi possível acessar ", endereco, ". Verifique a conexão com a internet.\n")
      retorne
    }

    // Obtém o conteúdo da página
    cadeia html = web.obter_texto(endereco)

    // O título começa logo depois da marca <title>, que tem 7 caracteres,
    // e termina onde começa a marca </title>
    inteiro comeco_titulo = t.posicao_texto("<title>", html, 0) + 7
    inteiro fim_titulo = t.posicao_texto("</title>", html, comeco_titulo)

    escreva("Título da página: ", t.extrair_subtexto(html, comeco_titulo, fim_titulo), "\n")
    escreva("\nConteúdo obtido (", t.numero_caracteres(html), " caracteres):\n\n", html, "\n")
  }
}
