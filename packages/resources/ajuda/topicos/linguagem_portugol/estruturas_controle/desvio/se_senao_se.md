# Se-senao se

Agora imagine que você precise verificar a nota da prova de um aluno e falar se ele foi muito bem, bem, razoável ou mau em uma prova. Como fazer isto?

Quando você precisa verificar se uma condição é verdadeira e, se não for, verificar se outra condição é verdadeira, uma das formas de se fazer esta verificação é utilizando o `se` ... `senao se`.

A sua sintaxe é parecida com a do `senao`, mas usando o comando `se` imediatamente após escrever o comando `senao`.

```portugol sintaxe title="Exemplo de Sintaxe"
logico condicao = falso
logico condicao2 = verdadeiro
se (condicao) {
  // Instruções a serem executadas se o desvio for verdadeiro
} senao se (condicao2) {
  // Instruções a serem executadas se o desvio anterior for falso e este desvio for verdadeiro
}
```

Também pode-se colocar o comando `senao` no final do último `senao se`; assim, quando todos os testes falharem, ele irá executar as instruções dentro do `senao`.

```portugol sintaxe title="Exemplo de Sintaxe"
se (12 < 5) {
  // Instruções a serem executadas se o desvio for verdadeiro
} senao se ("palavra" == "texto") {
  // Instruções a serem executadas se o desvio anterior for falso e este desvio for verdadeiro
} senao {
  // Instruções a serem executadas se o desvio anterior for falso
}
```

O exemplo a seguir ilustra em Portugol a resolução do problema de avisar se o aluno foi muito bem, bem, razoável ou mau em uma prova.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    real nota
    leia(nota)

    se (nota >= 9) {
      escreva("O aluno teve um desempenho muito bom na prova")
    } senao se (nota >= 7) {
      escreva("O aluno teve um desempenho bom na prova")
    } senao se (nota >= 6) {
      escreva("O aluno teve um desempenho razoável na prova")
    } senao {
      escreva("O aluno teve um desempenho mau na prova")
    }
  }
}
```
