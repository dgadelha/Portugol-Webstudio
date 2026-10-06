/**
 * Este exemplo lê as notas de uma turma, guarda tudo em um vetor e depois mostra a
 * média, a maior nota, a menor nota e quantos alunos ficaram acima da média.
 * Ele mostra por que o vetor é útil: depois de calcular a média, ainda
 * precisamos olhar as notas de novo para compará-las com ela.
 */

programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    const inteiro MAXIMO_ALUNOS = 10
    real notas[MAXIMO_ALUNOS]
    inteiro quantidade
    real soma = 0.0, media, maior, menor
    inteiro acima_da_media = 0

    // O vetor tem espaço para no máximo 10 notas, então a quantidade
    // informada precisa caber nele
    faca {
      escreva("Quantos alunos há na turma (1 a ", MAXIMO_ALUNOS, ")? ")
      leia(quantidade)
    } enquanto (quantidade < 1 ou quantidade > MAXIMO_ALUNOS)

    // Lemos as notas, repetindo a pergunta se a nota estiver fora de 0 a 10
    para (inteiro i = 0; i < quantidade; i++) {
      faca {
        escreva("Nota do aluno ", i + 1, ": ")
        leia(notas[i])

        se (notas[i] < 0.0 ou notas[i] > 10.0) {
          escreva("A nota deve estar entre 0 e 10.\n")
        }
      } enquanto (notas[i] < 0.0 ou notas[i] > 10.0)

      soma = soma + notas[i]
    }

    media = soma / quantidade

    // Começamos a maior e a menor nota com a primeira nota do vetor e
    // depois comparamos com as outras
    maior = notas[0]
    menor = notas[0]

    para (inteiro i = 1; i < quantidade; i++) {
      se (notas[i] > maior) {
        maior = notas[i]
      }

      se (notas[i] < menor) {
        menor = notas[i]
      }
    }

    // Só agora, com a média pronta, conseguimos contar quem ficou acima dela
    para (inteiro i = 0; i < quantidade; i++) {
      se (notas[i] > media) {
        acima_da_media++
      }
    }

    escreva("\nMédia da turma: ", mat.arredondar(media, 1), "\n")
    escreva("Maior nota: ", maior, "\n")
    escreva("Menor nota: ", menor, "\n")

    se (acima_da_media == 0) {
      escreva("Nenhum aluno ficou acima da média.\n")
    } senao se (acima_da_media == 1) {
      escreva("1 aluno ficou acima da média.\n")
    } senao {
      escreva(acima_da_media, " alunos ficaram acima da média.\n")
    }
  }
}
