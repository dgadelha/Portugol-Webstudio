# ou

Em algumas situações, necessitamos que alguma instrução seja executada se uma entre várias condições for verdadeira. Por exemplo, se você quisesse testar se pelo menos uma entre duas variáveis distintas tem valor igual a 2, como faria? Para isso podemos utilizar o operador lógico `ou`.

Quando usamos o operador `ou` o resultado de uma operação lógica será verdadeiro sempre que UM dos operandos for verdadeiro. A tabela verdade a seguir ilustra o comportamento do operador `ou`.

| Operação 1 | Operação 2 | Operação 1 `ou` Operação 2 |
| ---------- | ---------- | -------------------------- |
| Verdadeiro | Verdadeiro | Verdadeiro                 |
| Verdadeiro | Falso      | Verdadeiro                 |
| Falso      | Verdadeiro | Verdadeiro                 |
| Falso      | Falso      | Falso                      |

Em geral, os operadores lógicos são utilizados em conjunto com as Estruturas de Controle.

```portugol sintaxe title="Exemplo de Sintaxe"
se (5 > 4 ou 7 == 6) { // Operação lógica 'ou' junto com operações relacionais.
  // Comandos
}

enquanto (falso ou 5 > 4) { // Operação lógica 'ou' junto com operações relacionais e tipo lógico.
  // Comandos
}

logico saida = 5 > 8 ou 4 < 12 ou 34 < 7 // Operação lógica 'ou' junto com operações relacionais.
```

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    // Teste utilizando o operador lógico "ou" onde a deve ser igual a 2 ou pelo menos b deve ser igual a 2, qualquer um destes satisfaz o teste oferecendo-lhe verdadeiro como resposta
    inteiro a = 2, b = 2
    se (a == 2 ou b == 2) {
      escreva("Teste positivo")
    }

    // Neste caso c é igual a 2, entretanto d não é igual a 2, mas qualquer uma das condições oferece ao teste como resposta: verdadeiro
    inteiro c = 2, d = 3
    se (c == 2 ou d == 2) {
      escreva("Teste positivo")
    }
  }
}
```
