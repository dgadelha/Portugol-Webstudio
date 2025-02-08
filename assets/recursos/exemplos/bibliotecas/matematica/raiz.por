
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
 * 	Este exemplo demonstra como obter a raíz de um número usando a função "raiz" da
 * 	biblioteca "Matematica".
 * 
 * Autores:
 * 
 * 	Luiz Fernando Noschang (noschang@univali.br)
 * 	
 * Data: 18/07/2014
 */
 
programa
{
	inclua biblioteca Matematica --> mat
	
	funcao inicio()
	{
		real numero
		real raiz

		numero = 4.0
		raiz = mat.raiz(numero, 2.0) // Obtém a raíz quadrada do número
		
		escreva("A raíz quadrada de ", numero , " é: ", raiz, "\n")

		numero = 27.0
		raiz = mat.raiz(numero, 3.0) // Obtém a raíz cúbica do número

		escreva("A raíz cúbica de ", numero , " é: ", raiz, "\n")
	}
}

