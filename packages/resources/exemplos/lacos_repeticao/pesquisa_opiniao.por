/**
 * Este exemplo faz uma pesquisa sobre a fruta preferida da turma. Cada pessoa
 * digita o número da sua fruta, e a votação termina quando alguém digita 0.
 * Ele mostra o laço "faca-enquanto" repetindo a leitura, o "escolha" contando
 * os votos e o cálculo da porcentagem de cada opção.
 */

programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    // Um contador para cada opção. Todos começam em zero
    inteiro votos_banana = 0, votos_maca = 0, votos_laranja = 0
    inteiro voto, total_votos

    escreva("Qual é a sua fruta preferida?\n")
    escreva("  1) Banana\n")
    escreva("  2) Maçã\n")
    escreva("  3) Laranja\n")
    escreva("  0) Encerrar a pesquisa\n")

    // O laço se repete até que alguém digite 0. Como o "faca-enquanto"
    // verifica a condição só no final, o primeiro voto é sempre lido
    faca {
      escreva("\nDigite o seu voto: ")
      leia(voto)

      escolha (voto) {
        caso 0:
          escreva("Pesquisa encerrada!\n")
          pare
        caso 1:
          votos_banana = votos_banana + 1
          escreva("Voto registrado: Banana\n")
          pare
        caso 2:
          votos_maca = votos_maca + 1
          escreva("Voto registrado: Maçã\n")
          pare
        caso 3:
          votos_laranja = votos_laranja + 1
          escreva("Voto registrado: Laranja\n")
          pare
        caso contrario:
          // Um número fora das opções não é contado
          escreva("Opção inválida. Digite 1, 2, 3 ou 0.\n")
      }
    } enquanto (voto != 0)

    total_votos = votos_banana + votos_maca + votos_laranja

    // Só calculamos as porcentagens se houver votos, pois não é
    // possível dividir por zero
    se (total_votos == 0) {
      escreva("\nNinguém votou.\n")
    } senao {
      // Multiplicamos por 100.0 (um número real) para que a divisão
      // tenha casas decimais em vez de ser uma divisão inteira
      escreva("\nTotal de votos: ", total_votos, "\n")
      escreva("  Banana: ", votos_banana, " (", mat.arredondar(votos_banana * 100.0 / total_votos, 1), "%)\n")
      escreva("  Maçã: ", votos_maca, " (", mat.arredondar(votos_maca * 100.0 / total_votos, 1), "%)\n")
      escreva("  Laranja: ", votos_laranja, " (", mat.arredondar(votos_laranja * 100.0 / total_votos, 1), "%)\n")
    }
  }
}
