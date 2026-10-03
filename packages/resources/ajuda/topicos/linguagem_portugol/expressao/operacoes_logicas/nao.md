# nao

Em algumas situações necessitamos verificar se o contrário de uma sentença é verdadeiro ou não. Por exemplo, se você tem uma variável com um valor falso, e quer fazer um teste que será positivo sempre que essa variável for falsa, como faria? Para isso podemos utilizar o operador lógico `nao`.

O operador `nao` funciona de forma diferente pois necessita apenas de um operando. Quando usamos o operador `nao`, o valor lógico do operando é invertido, ou seja, o valor falso torna-se verdadeiro e o verdadeiro torna-se falso.

Em geral, os operadores lógicos são utilizados em conjunto com as Estruturas de Controle.

```portugol sintaxe title="Exemplo de Sintaxe"
se (nao falso) { // Operação lógica 'nao' junto com tipo lógico.
  // Comandos
}

enquanto (nao (5 < 4)) { // Operação lógica 'nao' junto com operações relacionais e tipo lógico.
  // Comandos
}

logico saida = nao (5 > 3 e 4 < 5) e 6 < 7 // Operação lógica 'nao' junto com operações relacionais e duas operações lógicas 'e'.
```

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    // Neste caso de teste a variável teste foi inicializada como falso, e foi verificado se teste não é verdadeiro
    logico teste = falso
    se (nao (teste)) {
      escreva("Teste positivo")
    }

    // Neste caso teste a soma das variáveis a e b resulta em 5, e comparado se a mesma é maior que 7, entretanto o operador nao, verifica se a+b não são maiores que 7
    inteiro a = 2, b = 3
    se (nao (a + b > 7)) {
      escreva("Teste positivo")
    }
  }
}
```
