programa
{
	
    funcao inicio()
    {
        cadeia nome

        //imprime a frase "Qual é o seu nome?"
        escreva("Qual é o seu nome ?\n")

        //Detecta o que o usuario escreveu na tela
        leia(nome)
		
        //Limpa tudo que estava escrito no console 
        limpa()
		
        //Escreve resposta
        escreva("Olá "+nome)
    }
}
