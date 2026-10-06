/*
 * Copyright (C) 2014 - UNIVALI - Universidade do Vale do Itajaí
 *
 * Este arquivo de código fonte é livre para utilização, cópia e/ou modificação
 * desde que este cabeçalho, contendo os direitos autorais e a descrição do programa,
 * seja mantido.
 *
 * Se tiver dificuldade em compreender este exemplo, acesse as vídeoaulas do Portugol
 * Studio para auxiliá-lo:
 *
 * https://www.youtube.com/watch?v=K02TnB3IGnQ&list=PLb9yvNDCid3jQAEbNoPHtPR0SWwmRSM-t
 *
 * Descrição:
 *
 *   Este exemplo pede o nome do usuário e três valores inteiros, os quais
 *   representam a quantidade de parafusos, arruelas e porcas comprados.
 *   Após, exibe o nome do usuário seguido da quantidade de cada item comprado
 *   e o valor total a ser pago.
 *
 * Autores:
 *
 *   Giordana Maria da Costa Valle
 *   Carlos Alexandre Krueger
 *
 * Data: 01/06/2013
 */

programa {
  inclua biblioteca Matematica --> mat

  funcao inicio() {
    // Os preços dos produtos são definidos em constantes

    const real PRECO_PARAFUSO = 1.50
    const real PRECO_ARRUELA = 2.00
    const real PRECO_PORCA = 2.50

    cadeia nome
    inteiro quantidade_parafusos, quantidade_arruelas, quantidade_porcas
    real total_parafusos, total_arruelas, total_porcas, total_pagar

    escreva("Digite seu nome: ")
    leia(nome)

    escreva("\nDigite a quantidade de parafusos que deseja comprar: ")
    leia(quantidade_parafusos)

    escreva("Digite a quantidade de arruelas que deseja comprar: ")
    leia(quantidade_arruelas)

    escreva("Digite a quantidade de porcas que deseja comprar: ")
    leia(quantidade_porcas)

    /*
     * Cálculo dos valores a serem pagos. O cálculo é feito multiplicando
     * a quantidade de itens comprados pelo preço de cada item
     */
    total_parafusos = PRECO_PARAFUSO * quantidade_parafusos
    total_arruelas = PRECO_ARRUELA * quantidade_arruelas
    total_porcas = PRECO_PORCA * quantidade_porcas

    total_pagar = total_parafusos + total_porcas + total_arruelas

    limpa()

    escreva("Cliente: ", nome, "\n")
    escreva("===============================\n")
    escreva("Parafusos: ", quantidade_parafusos, "\n")
    escreva("Arruelas: ", quantidade_arruelas, "\n")
    escreva("Porcas: ", quantidade_porcas, "\n")
    escreva("===============================\n")
    // O Portugol mostra os números reais com ponto no lugar da vírgula e sem os
    // zeros do fim: R$ 32,50 aparece como R$ 32.5. A função "arredondar" garante
    // no máximo duas casas decimais
    escreva("Total a pagar: R$ ", mat.arredondar(total_pagar, 2), "\n")
  }
}
