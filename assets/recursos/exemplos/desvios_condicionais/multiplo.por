
/* CLIQUE NO SINAL DE "+", À ESQUERDA, PARA EXIBIR A DESCRIÇÃO DO EXEMPLO
 *  
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
 * 	Este exemplo pede ao usuário que informe um valor inteiro, logo após, exibe uma 
 * 	mensagem indicando se o número informado é multiplo de 5 ou não.
 * 
 * Autores:
 * 
 * 	Giordana Maria da Costa Valle
 * 	Carlos Alexandre Krueger
 * 	
 * Data: 01/06/2013
 */

programa
{
	funcao inicio()
	{
		inteiro numero, multiplo
		
		escreva("Digite um número: ")
		leia(numero)

		/* 
		 *  Para verificar se um número é múltiplo de outro utiliza-se a operação
		 *  módulo, representada no Portugol pela operador %.
		 *  
		 *  Se o resultado da operação for 0, então um número é múltiplo do outro.
		 */

		limpa()
		
		se (numero % 5 == 0) 
		{
			escreva("O número ", numero, " é multiplo de 5")	
		}
		senao
		{
			escreva("O número ", numero, " não é multiplo de 5")
		}

		escreva("\n")
	}
}

