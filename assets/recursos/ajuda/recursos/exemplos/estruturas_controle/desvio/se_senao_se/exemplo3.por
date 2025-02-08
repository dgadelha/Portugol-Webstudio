programa  
{  
    funcao inicio()  
    { 
    	real nota
    	leia(nota)
    	se(nota >= 9)
    	{
    		escreva("O aluno foi um desempenho muito bom na prova")
		}
   		senao se (nota >= 7)
   		{
   			escreva("O aluno teve um desempenho bom na prova")
   		}
   		senao se (nota >= 6)
   		{
   			escreva("O aluno teve um desempenho razoável na prova")
   		}
   		senao
   		{
   			escreva("O aluno teve um desempenho mau na prova")
   		}
  	}  
}  
