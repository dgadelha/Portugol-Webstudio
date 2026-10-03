# Operação de Bitwise XOR

O operador binário XOR, ou disjunção binária exclusiva devolve um bit '1' sempre que o número de operandos iguais a 1 é ímpar, conforme podemos confirmar pela tabela de verdade, onde A e B são bits de entrada e S é o bit-resposta, ou bit de saída:

| B   | A   | S   |
| --- | --- | --- |
| 0   | 0   | 0   |
| 0   | 1   | 1   |
| 1   | 0   | 1   |
| 1   | 1   | 0   |

Sua sintaxe é o operador '^' entre os dois inteiros.

```portugol sintaxe title="Exemplo de Sintaxe"
/*
Para se fazer a operação Bitwise 5 XOR 3
0101 (decimal 5)
XOR
0011 (decimal 3)
----
0110 (decimal 6)
 */
inteiro resultado = 5 ^ 3
```

## Tabela de compatibilidade de tipos da operação de Bitwise XOR

| Operando Esquerdo | Operando Direito | Tipo Resultado | Exemplo  | Resultado |
| ----------------- | ---------------- | -------------- | -------- | --------- |
| `inteiro`         | `inteiro`        | `inteiro`      | `2 ^ 10` | `8`       |

Lembre-se que os operadores bitwise só trabalham com números do Tipo Inteiro. O exemplo a seguir ilustra em Portugol o mesmo exemplo usado anteriormente.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    escreva(5 ^ 3)
  }
}
```
