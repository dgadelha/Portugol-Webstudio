/**
 * Este exemplo mostra como usar a biblioteca "Objetos" para guardar os dados de
 * vários alunos. Cada aluno é um objeto com as propriedades nome, idade e nota.
 * Os endereços dos objetos ficam guardados em um vetor.
 */

programa {
  inclua biblioteca Objetos --> obj

  // O vetor não guarda os alunos em si, e sim o endereço de cada objeto. O
  // endereço é um número inteiro que identifica o objeto na memória, e é ele que
  // passamos para as funções da biblioteca quando queremos ler ou alterar o objeto
  inteiro alunos[3]

  funcao inicio() {
    // Cria os objetos e guarda os seus endereços no vetor
    alunos[0] = criar_aluno("Ana", 17, 9.5)
    alunos[1] = criar_aluno("Bruno", 18, 7.0)
    alunos[2] = criar_aluno("Carla", 16, 8.25)

    escreva("Alunos cadastrados:\n\n")

    para (inteiro i = 0; i < 3; i++) {
      mostrar_aluno(alunos[i])
    }

    // Um objeto pode ganhar novas propriedades a qualquer momento. Aqui só a
    // Carla recebe a propriedade "apelido"
    obj.atribuir_propriedade(alunos[2], "apelido", "Cacau")

    escreva("\nQuem tem apelido?\n")

    para (inteiro i = 0; i < 3; i++) {
      cadeia nome = obj.obter_propriedade_tipo_cadeia(alunos[i], "nome")

      // A função "contem_propriedade" diz se o objeto tem uma propriedade com
      // esse nome. Assim evitamos ler uma propriedade que não existe
      se (obj.contem_propriedade(alunos[i], "apelido")) {
        escreva("  ", nome, ": ", obj.obter_propriedade_tipo_cadeia(alunos[i], "apelido"), "\n")
      } senao {
        escreva("  ", nome, ": sem apelido\n")
      }
    }

    // Calcula a média das notas lendo a propriedade "nota" de cada objeto
    real soma = 0.0

    para (inteiro i = 0; i < 3; i++) {
      soma = soma + obj.obter_propriedade_tipo_real(alunos[i], "nota")
    }

    escreva("\nMédia da turma: ", soma / 3, "\n")

    // Ao final, removemos todos os objetos da memória
    obj.liberar()
  }

  // Cria um objeto vazio, atribui as suas propriedades e retorna o seu endereço
  funcao inteiro criar_aluno(cadeia nome, inteiro idade, real nota) {
    inteiro aluno = obj.criar_objeto()

    // Se a propriedade ainda não existe, "atribuir_propriedade" cria a
    // propriedade. Cada uma pode guardar um tipo diferente de valor
    obj.atribuir_propriedade(aluno, "nome", nome)
    obj.atribuir_propriedade(aluno, "idade", idade)
    obj.atribuir_propriedade(aluno, "nota", nota)

    retorne aluno
  }

  // Lê as propriedades do objeto. Para cada tipo de valor existe uma função
  // "obter_propriedade_tipo_..." própria
  funcao mostrar_aluno(inteiro aluno) {
    cadeia nome = obj.obter_propriedade_tipo_cadeia(aluno, "nome")
    inteiro idade = obj.obter_propriedade_tipo_inteiro(aluno, "idade")
    real nota = obj.obter_propriedade_tipo_real(aluno, "nota")

    escreva(nome, ", ", idade, " anos, nota ", nota, "\n")
  }
}
