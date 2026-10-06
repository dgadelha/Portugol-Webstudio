/**
 * Este exemplo pede para você criar uma senha e repete a pergunta até que ela siga
 * as regras: ter pelo menos 6 caracteres e pelo menos um número. Ele mostra como
 * usar o laço "faca-enquanto" para validar uma entrada e como percorrer os
 * caracteres de um texto com a biblioteca Texto.
 */

programa {
  inclua biblioteca Texto --> tx

  funcao inicio() {
    cadeia senha, confirmacao
    logico tamanho_ok, tem_numero

    escreva("Crie uma senha com pelo menos 6 caracteres e pelo menos um número.\n")

    // O laço se repete enquanto a senha não cumprir as duas regras
    faca {
      escreva("\nNova senha: ")
      leia(senha)

      // Regra 1: o tamanho. A função "numero_caracteres" conta os caracteres
      tamanho_ok = tx.numero_caracteres(senha) >= 6

      // Regra 2: ter um número. Olhamos um caractere de cada vez, das posições
      // 0 até (tamanho - 1), e verificamos se ele está entre '0' e '9'
      tem_numero = falso

      para (inteiro i = 0; i < tx.numero_caracteres(senha); i++) {
        caracter c = tx.obter_caracter(senha, i)

        se (c >= '0' e c <= '9') {
          tem_numero = verdadeiro
        }
      }

      // Explicamos o que falta, para a pessoa saber o que corrigir
      se (nao tamanho_ok) {
        escreva("A senha precisa ter pelo menos 6 caracteres.\n")
      }

      se (nao tem_numero) {
        escreva("A senha precisa ter pelo menos um número.\n")
      }
    } enquanto (nao (tamanho_ok e tem_numero))

    escreva("Senha válida!\n")

    // Por fim, pedimos para digitar de novo, até as duas senhas serem iguais
    faca {
      escreva("\nDigite a senha novamente para confirmar: ")
      leia(confirmacao)

      se (confirmacao != senha) {
        escreva("As senhas não são iguais, tente de novo.\n")
      }
    } enquanto (confirmacao != senha)

    escreva("Senha criada com sucesso!\n")
  }
}
