# e

Em algumas situações, necessitamos que alguma instrução só seja executada se outras condições forem verdadeiras. Por exemplo, se você quisesse testar se duas variáveis distintas têm valor igual a 2, como faria? Para isso podemos utilizar o operador lógico `e`.

Quando usamos o operador `e` o resultado de uma operação lógica será verdadeiro somente quando AMBOS os operandos forem verdadeiros. Ou seja, basta que um deles seja falso e a resposta será falsa. A tabela a seguir é conhecida como tabela verdade e ilustra o comportamento do operador `e`.

| Operação 1 | Operação 2 | Operação 1 `e` Operação 2 |
| ---------- | ---------- | ------------------------- |
| Verdadeiro | Verdadeiro | Verdadeiro                |
| Verdadeiro | Falso      | Falso                     |
| Falso      | Verdadeiro | Falso                     |
| Falso      | Falso      | Falso                     |

Em geral, os operadores lógicos são utilizados em conjunto com as Estruturas de Controle.

```portugol sintaxe title="Exemplo de Sintaxe"
se (5 > 4 e 6 == 6) { // Operação lógica 'e' junto com operações relacionais.
  // Comandos
}

enquanto (verdadeiro e 5 < 4) { // Operação lógica 'e' junto com operações relacionais e tipo lógico.
  // Comandos
}

logico saida = 5 > 3 e 4 < 5 e 6 < 7 // Operação lógica 'e' junto com operações relacionais.
```

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    // Teste utilizando o operador lógico "e" onde a deve ser igual a 2 e b deve ser igual a 2 também
    inteiro a = 2, b = 2
    se (a == 2 e b == 2) {
      escreva("Teste positivo")
    }

    // Neste caso c é igual a 2, entretanto d não é igual a 2, logo este teste não terá como resposta verdadeiro
    inteiro c = 2, d = 3
    se (c == 2 e d == 2) {
      escreva("Teste positivo")
    }

    // Neste caso de teste g é igual a 2 e f é diferente de 3, logo este teste terá como resposta verdadeiro
    inteiro g = 2, f = 2
    se (g == 2 e f != 3) {
      escreva("Teste positivo")
    }
  }
}
```
