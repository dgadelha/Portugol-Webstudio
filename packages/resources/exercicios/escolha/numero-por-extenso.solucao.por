programa {
  funcao inicio() {
    inteiro numero, unidade

    leia(numero)

    se (numero < 20) {
      unidade = numero
    } senao {
      unidade = numero % 10

      escolha (numero / 10) {
        caso 2:
          escreva("vinte")
          pare
        caso 3:
          escreva("trinta")
          pare
        caso 4:
          escreva("quarenta")
          pare
        caso 5:
          escreva("cinquenta")
          pare
        caso 6:
          escreva("sessenta")
          pare
        caso 7:
          escreva("setenta")
          pare
        caso 8:
          escreva("oitenta")
          pare
        caso 9:
          escreva("noventa")
          pare
      }

      se (unidade != 0) {
        escreva(" e ")
      }
    }

    escolha (unidade) {
      caso 0:
        se (numero == 0) {
          escreva("zero")
        }
        pare
      caso 1:
        escreva("um")
        pare
      caso 2:
        escreva("dois")
        pare
      caso 3:
        escreva("três")
        pare
      caso 4:
        escreva("quatro")
        pare
      caso 5:
        escreva("cinco")
        pare
      caso 6:
        escreva("seis")
        pare
      caso 7:
        escreva("sete")
        pare
      caso 8:
        escreva("oito")
        pare
      caso 9:
        escreva("nove")
        pare
      caso 10:
        escreva("dez")
        pare
      caso 11:
        escreva("onze")
        pare
      caso 12:
        escreva("doze")
        pare
      caso 13:
        escreva("treze")
        pare
      caso 14:
        escreva("quatorze")
        pare
      caso 15:
        escreva("quinze")
        pare
      caso 16:
        escreva("dezesseis")
        pare
      caso 17:
        escreva("dezessete")
        pare
      caso 18:
        escreva("dezoito")
        pare
      caso 19:
        escreva("dezenove")
        pare
    }

    escreva("\n")
  }
}
