/**
 * Este exemplo demonstra como utilizar a função "arquivo_existe" da biblioteca
 * "Arquivos" para verificar se um arquivo existe antes de abri-lo. Tentar abrir para
 * leitura um arquivo que não existe causa um erro na execução do programa.
 */

programa {
  inclua biblioteca Arquivos --> a

  funcao inicio() {
    // Este arquivo está na mesma pasta do exemplo
    verificar("./placar.txt")

    // Este arquivo não existe
    verificar("./arquivo_inexistente.txt")
  }

  funcao verificar(cadeia caminho) {
    se (a.arquivo_existe(caminho)) {
      // Como o arquivo existe, é seguro abri-lo para leitura
      inteiro endereco = a.abrir_arquivo(caminho, a.MODO_LEITURA)

      escreva("O arquivo \"", caminho, "\" existe. Primeira linha:\n")
      escreva(a.ler_linha(endereco), "\n\n")

      a.fechar_arquivo(endereco)
    } senao {
      escreva("O arquivo \"", caminho, "\" não existe\n\n")
    }
  }
}
