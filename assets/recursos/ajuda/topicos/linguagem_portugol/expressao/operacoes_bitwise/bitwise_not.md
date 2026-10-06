# Operação de Bitwise NOT

Muito semelhante ao operador lógico 'nao', o operador unário NOT, ou negação binária inverte cada bit do operando: devolve um bit '1' sempre que o bit de entrada for '0', e vice-versa, conforme podemos confirmar pela tabela de verdade, onde A é o bit de entrada e S é o bit-resposta, ou bit de saída:

| A   | S   |
| --- | --- |
| 0   | 1   |
| 1   | 0   |

Sua sintaxe é o operador '~' antes do inteiro.

```portugol sintaxe title="Exemplo de Sintaxe"
/*
Para se fazer a operação Bitwise NOT 7
0111  (decimal 7)
NOT
----
1000  (decimal 8)
 */
inteiro resultado = ~7
```

## Tabela de compatibilidade de tipos da operação de Bitwise NOT

| Operando  | Tipo Resultado | Exemplo | Resultado |
| --------- | -------------- | ------- | --------- |
| `inteiro` | `inteiro`      | `~ 1`   | `-2`      |

Lembre-se que os operadores bitwise só trabalham com números do Tipo Inteiro. O exemplo a seguir ilustra em Portugol o mesmo exemplo usado anteriormente. É importante a compreensão do conceito "Complemento de dois" presente no menu "Operações Bitwise".

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    escreva(~7)
  }
}
```
