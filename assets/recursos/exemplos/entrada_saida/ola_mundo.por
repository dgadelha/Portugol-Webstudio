/**
 * Este exemplo é o primeiro programa clássico de quem aprende a programar: ele
 * exibe a mensagem "Olá, mundo!" na tela. Os comentários explicam as partes que
 * todo programa em Portugol tem: "programa", "funcao inicio" e "escreva".
 */

programa {
  // Todo código em Portugol fica dentro deste bloco "programa { ... }"

  // A função "inicio" é o ponto de partida: quando o programa é executado,
  // as instruções dentro dela são realizadas uma a uma, de cima para baixo
  funcao inicio() {
    // O comando "escreva" exibe na tela o texto que está entre aspas.
    // O "\n" no final faz o cursor pular para a próxima linha
    escreva("Olá, mundo!\n")

    // Podemos usar "escreva" quantas vezes quisermos
    escreva("Este é o meu primeiro programa em Portugol.\n")
  }
}
