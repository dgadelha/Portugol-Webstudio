/**
 * Este exemplo demonstra como utilizar as funções da biblioteca "Tipos" para verificar
 * e converter dados do tipo logico para outros tipos e vice-versa.
 */

programa {
  inclua biblioteca Tipos --> tp

  funcao inicio() {
    cadeia resposta = "verdadeiro"
    caracter opcao = 'n'
    logico valor

    // Aqui utilizamos a função "cadeia_e_logico" para verificar se uma cadeia
    // representa um valor lógico, isto é, se o seu conteúdo é exatamente
    // "verdadeiro" ou "falso"
    se (tp.cadeia_e_logico(resposta)) {
      // Já sabemos que esta cadeia representa um valor lógico. Agora usamos
      // a função "cadeia_para_logico" para convertê-la
      valor = tp.cadeia_para_logico(resposta)
      escreva("A cadeia \"", resposta, "\" foi convertida no valor lógico ", valor, "\n")
    }

    // Uma cadeia como "sim" não representa um valor lógico
    se (nao tp.cadeia_e_logico("sim")) {
      escreva("A cadeia \"sim\" não representa um valor lógico\n")
    }

    // Um caractere também pode representar um valor lógico: 'S' ou 's' para
    // verdadeiro, e 'N' ou 'n' para falso. Isso é útil em perguntas de sim ou não
    se (tp.caracter_e_logico(opcao)) {
      valor = tp.caracter_para_logico(opcao)
      escreva("\nO caractere '", opcao, "' representa o valor lógico ", valor, "\n")
    }

    // Os números inteiros também podem ser convertidos: valores menores ou
    // iguais a 0 se tornam falso, e valores maiores ou iguais a 1 se tornam verdadeiro
    escreva("\nO número 0 convertido em lógico é: ", tp.inteiro_para_logico(0), "\n")
    escreva("O número 5 convertido em lógico é: ", tp.inteiro_para_logico(5), "\n")

    // Por último, um valor lógico pode ser convertido para os outros tipos
    valor = verdadeiro

    escreva("\nO valor lógico ", valor, " convertido em:\n")
    escreva("  cadeia: \"", tp.logico_para_cadeia(valor), "\"\n")
    escreva("  caracter: '", tp.logico_para_caracter(valor), "'\n")
    escreva("  inteiro: ", tp.logico_para_inteiro(valor), "\n")
  }
}
