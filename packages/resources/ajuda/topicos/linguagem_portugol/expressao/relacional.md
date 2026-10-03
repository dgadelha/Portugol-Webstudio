# Operações Relacionais

Vamos imaginar que você precise verificar se um número digitado pelo usuário é positivo ou negativo. Como poderíamos verificar isto? Através de uma operação relacional. As operações relacionais também são nossas conhecidas da Matemática. Em algoritmos, os operadores relacionais são importantes, pois permitem realizar comparações que terão como resultado um valor lógico (verdadeiro ou falso).

Os símbolos que usamos para os operadores também mudam um pouco em relação ao que usamos no papel. Os símbolos para diferente, maior ou igual e menor ou igual mudam pois não existem nos teclados convencionais. A tabela a seguir mostra todas as operações relacionais e os símbolos que o Portugol utiliza.

| Operação       | Símbolo |
| -------------- | ------- |
| Maior          | >       |
| Menor          | <       |
| Maior ou igual | >=      |
| Menor ou igual | <=      |
| Igual          | ==      |
| Diferente      | !=      |

A tabela a seguir apresenta a estrutura de algumas dessas operações.

| Operação        | Resultado  |
| --------------- | ---------- |
| 3 > 4           | Falso      |
| 7 != 7          | Falso      |
| 9 == 10 - 1     | Verdadeiro |
| 33 <= 100       | Verdadeiro |
| 6 >= 5 + 1      | Verdadeiro |
| 5 + 4 <= 11 - 2 | Verdadeiro |

Nos dois últimos exemplos, temos operadores aritméticos e relacionais juntos. Nestes casos, realiza-se primeiro a operação aritmética e depois a relacional.

Em geral, as operações relacionais são utilizadas em conjunto com as Estruturas de Controle. Veja a sintaxe:

```portugol sintaxe title="Exemplo de Sintaxe"
se (5 > 3) { // Estrutura de controle: "se (...)", Operação relacional: "5 > 3"
  // Conjunto de comandos se for verdadeiro
}

para (i = 0; i < 5; i++) { // Estrutura de controle: "para(...)", Operação relacional: "i < 5"
  // Conjunto de comandos a serem repetidos até a expressão se tornar falsa
}

faca { // Estrutura de controle "faca{}enquanto(...)", Operação relacional: "6 < 2"
  // Conjunto de comandos a serem repetidos enquanto a condição for verdadeira após a primeira execução.
} enquanto (6 < 2)
```

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    // Comparação entre valor A e B utilizando o operador maior que
    inteiro a = 5, b = 3
    se (a > b) {
      escreva("A é maior que B")
    }

    // Comparação entre A e B utilizando o operador igual a
    se (a == b) {
      escreva("A é igual a B")
    }

    // Comparação entre A e B utilizando o operador maior ou igual a
    se (a >= b) {
      escreva("A é maior ou igual a B")
    }

    // Nos testes acima somente o primeiro teste A > B é verdadeiro, deste modo somente esta mensagem será exibida
  }
}
```
