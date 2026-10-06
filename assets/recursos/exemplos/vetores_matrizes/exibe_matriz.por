/**
 * Este exemplo guarda em uma matriz as notas de 3 alunos em 4 provas e as
 * exibe em forma de tabela. Ele mostra como declarar uma matriz, como acessar
 * um elemento pela linha e pela coluna, e como percorrê-la com dois laços "para".
 */

programa {
  funcao inicio() {
    const inteiro ALUNOS = 3
    const inteiro PROVAS = 4

    // Uma matriz é como uma tabela: cada linha é um aluno e cada coluna é uma prova.
    // Os valores podem ser informados já na declaração, linha por linha
    inteiro notas[ALUNOS][PROVAS] = {
      {7, 8, 6, 9},
      {5, 6, 7, 6},
      {9, 9, 8, 10}
    }

    // Para acessar um elemento, informamos a linha e depois a coluna.
    // Assim como nos vetores, a contagem começa em 0: notas[1][2] é a nota
    // do segundo aluno (linha 1) na terceira prova (coluna 2)
    escreva("Nota do aluno 2 na prova 3: ", notas[1][2], "\n")

    // Também podemos alterar um elemento. O primeiro aluno refez a prova 1
    notas[0][0] = 8
    escreva("O aluno 1 refez a prova 1 e agora tem nota ", notas[0][0], "\n\n")

    // Para percorrer a matriz, usamos um laço para as linhas e, dentro dele,
    // outro laço para as colunas. Para cada linha, todas as colunas são visitadas
    escreva("Notas de todos os alunos:\n")

    para (inteiro aluno = 0; aluno < ALUNOS; aluno++) {
      escreva("Aluno ", aluno + 1, ":")

      para (inteiro prova = 0; prova < PROVAS; prova++) {
        escreva(" ", notas[aluno][prova])
      }

      // Depois de exibir todas as colunas de uma linha, pulamos para a próxima
      escreva("\n")
    }
  }
}
