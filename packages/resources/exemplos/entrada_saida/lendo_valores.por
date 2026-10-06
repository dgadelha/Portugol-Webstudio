/**
 * Este exemplo mostra como usar o comando "leia" para guardar em variáveis
 * os valores digitados pelo usuário. São lidos valores de cada tipo básico
 * (cadeia, inteiro, real, caracter e logico), que depois são exibidos com "escreva".
 */

programa {
  funcao inicio() {
    // Antes de ler um valor, precisamos declarar a variável que vai guardá-lo.
    // O tipo da variável define que tipo de valor o usuário pode digitar
    cadeia nome
    inteiro idade
    real altura
    caracter letra_sobrenome
    logico gosta_de_programar

    // Sempre escrevemos uma pergunta antes do "leia", para que o usuário
    // saiba o que deve digitar. O "leia" espera o usuário digitar um valor
    // e apertar Enter, e então guarda esse valor na variável
    escreva("Qual é o seu nome? ")
    leia(nome)

    // Uma variável do tipo inteiro aceita apenas números sem casas decimais
    escreva("Quantos anos você tem? ")
    leia(idade)

    // Uma variável do tipo real aceita números com casas decimais.
    // As casas decimais são separadas por ponto, por exemplo: 1.65
    escreva("Qual é a sua altura em metros? ")
    leia(altura)

    // Uma variável do tipo caracter guarda um único caractere
    escreva("Qual é a primeira letra do seu sobrenome? ")
    leia(letra_sobrenome)

    // Uma variável do tipo logico só aceita os valores verdadeiro ou falso
    escreva("Você gosta de programar? (digite verdadeiro ou falso) ")
    leia(gosta_de_programar)

    // Agora usamos "escreva" para mostrar os valores guardados. Separando os
    // itens por vírgula, podemos misturar textos e variáveis na mesma linha
    escreva("\nVeja o que você digitou:\n")
    escreva("Nome: ", nome, "\n")
    escreva("Idade: ", idade, " anos\n")
    escreva("Altura: ", altura, " metros\n")
    escreva("Primeira letra do sobrenome: ", letra_sobrenome, "\n")
    escreva("Gosta de programar: ", gosta_de_programar, "\n")
  }
}
