# Operação de Bitwise OR

O operador binário OR, ou disjunção binária devolve um bit 1 sempre que pelo menos um dos operandos for '1', conforme podemos confirmar pela tabela de verdade, onde A e B são os bits de entrada e S é o bit-resposta, ou bit de saída:

| B   | A   | S   |
| --- | --- | --- |
| 0   | 0   | 0   |
| 0   | 1   | 1   |
| 1   | 0   | 1   |
| 1   | 1   | 1   |

Sua sintaxe é o operador '\|' (barra vertical, em inglês: pipe) entre os dois inteiros.

```portugol sintaxe title="Exemplo de Sintaxe"
/*
Para se fazer a operação Bitwise 5 OR 3
0101 (decimal 5)
OR
0011 (decimal 3)
----
0111 (decimal 7)
 */
inteiro resultado = 5 | 3
```

## Tabela de compatibilidade de tipos da operação de Bitwise OR

| Operando Esquerdo | Operando Direito | Tipo Resultado | Exemplo  | Resultado |
| ----------------- | ---------------- | -------------- | -------- | --------- |
| `inteiro`         | `inteiro`        | `inteiro`      | `2 \| 8` | `10`      |

Lembre-se que os operadores bitwise só trabalham com números do Tipo Inteiro. O exemplo a seguir ilustra em Portugol o mesmo exemplo usado anteriormente.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    escreva(5 | 3)
  }
}
```
