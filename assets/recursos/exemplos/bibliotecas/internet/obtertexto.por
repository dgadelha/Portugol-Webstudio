programa
{
	inclua biblioteca Internet --> i
	inclua biblioteca Texto --> t
	inclua biblioteca Util --> u
	
	cadeia endereco = "https://portugol-web-counter-test.herokuapp.com/api"
	inteiro count = 1
	
	funcao inicio()
	{
		se(i.endereco_disponivel(endereco)){
			cadeia resp = i.obter_texto(endereco+"/users")
			inteiro val = t.numero_caracteres(resp)
			cadeia users = t.extrair_subtexto(resp, 23, val-1)
			escreva("Este exemplo já foi executado " + users + " vezes\n")
			escreva("\n\n\nConteudo capturado:\n"+resp)	
		}senao{
			se(count < 5){
				count++
				para(inteiro i = 5; i>0; i--){
					limpa()
					escreva("Endereço não encontrado, tentaremos pela "+count+"ª vez em "+i)
					u.aguarde(1000)
				}
				inicio()
			}
		}
	}
}
