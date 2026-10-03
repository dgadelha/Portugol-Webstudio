/**
 * Este exemplo demonstra como utilizar a função "selecionar_arquivo" da biblioteca
 * "Arquivos". Ela abre uma janela para que o usuário escolha um arquivo e retorna o
 * caminho do arquivo escolhido. Os formatos de arquivo aceitos são informados em um
 * vetor, no formato "descrição|extensão1,extensão2".
 */

programa {
  inclua biblioteca Arquivos --> a

  funcao inicio() {
    // Cada posição do vetor descreve um formato aceito: a descrição exibida na
    // janela, seguida de "|" e das extensões, separadas por vírgula
    cadeia formatos[] = {
      "Arquivos de texto|txt",
      "Imagens|png,jpg,gif"
    }

    // O segundo parâmetro indica se a opção "Todos os arquivos" deve ser
    // oferecida na janela
    cadeia caminho = a.selecionar_arquivo(formatos, verdadeiro)

    // Se o usuário fechar a janela ou cancelar a seleção, a função retorna
    // uma cadeia vazia
    se (caminho == "") {
      escreva("Nenhum arquivo foi selecionado\n")
    } senao {
      escreva("Você selecionou o arquivo:\n", caminho, "\n")
    }
  }
}
