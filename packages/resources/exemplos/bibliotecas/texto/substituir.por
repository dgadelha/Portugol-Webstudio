/**
 * Este exemplo usa a função "substituir" da biblioteca "Texto" para trocar um
 * trecho de um texto por outro. Ele mostra que a função troca todas as
 * ocorrências, diferencia letras maiúsculas de minúsculas e não altera a
 * variável original: ela devolve um novo texto.
 */

programa {
  inclua biblioteca Texto --> tx

  funcao inicio() {
    cadeia frase = "Eu gosto de café. O café da manhã é a melhor refeição."
    cadeia nova_frase

    escreva("Frase original:\n", frase, "\n\n")

    // A função recebe o texto, o trecho que queremos procurar e o trecho que
    // deve ficar no lugar dele. Todas as ocorrências do trecho são trocadas
    nova_frase = tx.substituir(frase, "café", "chá")
    escreva("Trocando \"café\" por \"chá\":\n", nova_frase, "\n\n")

    // A função não altera a variável que foi passada: ela devolve um novo
    // texto. Por isso a variável "frase" continua igual
    escreva("A variável frase continua igual:\n", frase, "\n\n")

    // Letras maiúsculas e minúsculas são diferentes para a função.
    // Como a frase não tem "CAFÉ" em maiúsculas, nada é trocado
    nova_frase = tx.substituir(frase, "CAFÉ", "chá")
    escreva("Procurando \"CAFÉ\" em maiúsculas:\n", nova_frase, "\n\n")

    // Para guardar a troca na própria variável, atribuímos o resultado a ela
    frase = tx.substituir(frase, "Eu gosto", "Nós gostamos")
    escreva("Guardando a troca na própria variável:\n", frase, "\n")
  }
}
