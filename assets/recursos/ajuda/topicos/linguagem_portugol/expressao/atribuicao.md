# Atribuições

Quando criamos uma variável, simplesmente separamos um espaço de memória para um conteúdo. Para especificar esse conteúdo, precisamos de alguma forma determinar um valor para essa variável. Para isso, usamos a operação de atribuição.

A instrução de atribuição serve para alterar o valor de uma variável. Ao fazer isso dizemos que estamos atribuindo um novo valor a esta variável. A atribuição de valores pode ser feita de variadas formas. Pode-se atribuir valores através de constantes, de dados digitados pelo usuário (Leia) ou mesmo através de comparações e operações com outras variáveis já existentes. Neste último caso, após a execução da operação, a variável conterá o valor resultante da operação. O sinal de igual "=" é o símbolo da atribuição no Portugol. A variável à esquerda do sinal de igual recebe o valor das operações que estiverem à direita.

Veja a sintaxe:

```portugol sintaxe title="Exemplo de Sintaxe"
variavel = 6
variavel = variavel2
variavel = 6 + 4 / variavel2
leia(variavel)
```

Note que uma variável só pode receber atribuições de um tipo compatível com o dela. Entre `inteiro` e `real` a conversão é automática (ao atribuir um `real` a um `inteiro`, a parte decimal é descartada), mas, por exemplo, se a variável "b" é do tipo cadeia e a variável "a" é do tipo inteiro, a atribuição `a = b` não poderá ser realizada.

Existem alguns operadores no Portugol que podem ser utilizados para atribuição de valores. São eles:

```portugol sintaxe title="Operandos:"
variavel1 += variavel2 // Equivalente a: variavel1 = variavel1 + variavel2;
variavel1 -= variavel2 // Equivalente a: variavel1 = variavel1 - variavel2;
variavel1 *= variavel2 // Equivalente a: variavel1 = variavel1 * variavel2;
variavel1 /= variavel2 // Equivalente a: variavel1 = variavel1 / variavel2;
variavel1++ // Equivalente a: variavel1 = variavel1 + 1;
variavel1-- // Equivalente a: variavel1 = variavel1 - 1;
```

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    // Atribuição de valores constantes a uma variável
    inteiro a
    a = 2

    // Atribuição através de entrada de dados, informado pelo usuário
    inteiro b
    leia(b)

    // Atribuição através de uma variável já informada pelo usuário
    inteiro c
    c = b
  }
}
```
