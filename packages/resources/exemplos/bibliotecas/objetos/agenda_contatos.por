/**
 * Este exemplo é uma pequena agenda de contatos com um menu de opções. Cada
 * contato é um objeto da biblioteca "Objetos", com as propriedades "nome" e
 * "telefone", e cada opção do menu é feita por uma função separada.
 */

programa {
  inclua biblioteca Objetos --> obj
  inclua biblioteca Texto --> tx

  const inteiro MAXIMO_CONTATOS = 10

  // Endereços dos objetos de cada contato e quantos contatos já foram adicionados
  inteiro contatos[MAXIMO_CONTATOS]
  inteiro total_contatos = 0

  funcao inicio() {
    inteiro opcao = 0

    // O menu se repete até que o usuário escolha a opção 4 (Sair)
    enquanto (opcao != 4) {
      escreva("\n===== AGENDA =====\n")
      escreva("1 - Adicionar contato\n")
      escreva("2 - Listar contatos\n")
      escreva("3 - Buscar por nome\n")
      escreva("4 - Sair\n")
      escreva("Escolha uma opção: ")
      leia(opcao)

      escolha (opcao) {
        caso 1:
          adicionar_contato()
          pare
        caso 2:
          listar_contatos()
          pare
        caso 3:
          buscar_contato()
          pare
        caso 4:
          escreva("\nAté logo!\n")
          pare
        caso contrario:
          escreva("\nOpção inválida. Digite um número de 1 a 4.\n")
      }
    }

    obj.liberar()
  }

  funcao adicionar_contato() {
    se (total_contatos == MAXIMO_CONTATOS) {
      escreva("\nA agenda está cheia.\n")
      retorne
    }

    cadeia nome, telefone

    escreva("\nNome: ")
    leia(nome)
    escreva("Telefone: ")
    leia(telefone)

    // Cria o objeto do contato e guarda o seu endereço na próxima posição livre
    inteiro contato = obj.criar_objeto()
    obj.atribuir_propriedade(contato, "nome", nome)
    obj.atribuir_propriedade(contato, "telefone", telefone)

    contatos[total_contatos] = contato
    total_contatos++

    escreva("Contato adicionado!\n")
  }

  funcao listar_contatos() {
    se (total_contatos == 0) {
      escreva("\nA agenda está vazia.\n")
      retorne
    }

    escreva("\nContatos:\n")

    para (inteiro i = 0; i < total_contatos; i++) {
      escreva(i + 1, ". ")
      mostrar_contato(contatos[i])
    }
  }

  funcao buscar_contato() {
    cadeia busca

    escreva("\nDigite o nome (ou parte dele): ")
    leia(busca)

    // Comparamos tudo em letras minúsculas, assim "ana" encontra "Ana"
    busca = tx.caixa_baixa(busca)

    inteiro encontrados = 0

    para (inteiro i = 0; i < total_contatos; i++) {
      cadeia nome = tx.caixa_baixa(obj.obter_propriedade_tipo_cadeia(contatos[i], "nome"))

      // "posicao_texto" retorna -1 quando a busca não aparece dentro do nome
      se (tx.posicao_texto(busca, nome, 0) != -1) {
        mostrar_contato(contatos[i])
        encontrados++
      }
    }

    se (encontrados == 0) {
      escreva("Nenhum contato encontrado.\n")
    }
  }

  // Lê as propriedades do objeto que está no endereço recebido e as exibe
  funcao mostrar_contato(inteiro contato) {
    cadeia nome = obj.obter_propriedade_tipo_cadeia(contato, "nome")
    cadeia telefone = obj.obter_propriedade_tipo_cadeia(contato, "telefone")

    escreva(nome, " - ", telefone, "\n")
  }
}
