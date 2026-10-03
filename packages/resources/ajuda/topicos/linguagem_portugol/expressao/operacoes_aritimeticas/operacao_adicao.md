# Operação de Adição

Adição é uma das operações básicas da álgebra. Na sua forma mais simples, adição combina dois números (termos, somandos ou parcelas), em um único número, a soma ou total. Adicionar mais números corresponde a repetir a operação.

A sintaxe é bem fácil: coloca-se o sinal de mais entre os operandos.

```portugol sintaxe title="Exemplo de Sintaxe"
escreva(1 + 5) // Operação Aritmética 1 + 5 sendo escrita na tela

real numero = 50 + 30 // Operação Aritmética 50 + 30 sendo armazenada na variável numero

se (20 + 40 < 70) { // Operação Aritmética 20 + 40 dentro de uma estrutura de controle "se" em conjunto com uma operação relacional "<".
  // Comandos
}
```

Note que você poderá atribuir o resultado desta operação a uma variável, ou mesmo executar diretamente através do comando escreva.

## Propriedades importantes

- **Comutatividade** A ordem das parcelas não altera o resultado da operação. Assim, se `2 + 3 = 5`, logo `3 + 2 = 5`.
- **Associatividade** O agrupamento das parcelas não altera o resultado. Assim, se `(2 + 3) + 1 = 6`, logo `2 + (3 + 1) = 6`.
- **Elemento neutro** A parcela `0` (zero) não altera o resultado das demais parcelas. O zero é chamado "elemento neutro" da adição. Assim, se `2 + 3 = 5`, logo `2 + 3 + 0 = 5`.
- **Fechamento** A soma de dois números reais será sempre um número do conjunto dos números reais.
- **Elemento oposto** A soma de qualquer número e o seu oposto é zero. Exemplo:
  - `2 + (-2) = 0`
  - `(-999) + 999 = 0`

## Tabela de compatibilidade de tipos da operação de adição

| Operando Esquerdo | Operando Direito | Tipo Resultado | Exemplo                             | Resultado                 |
| ----------------- | ---------------- | -------------- | ----------------------------------- | ------------------------- |
| `cadeia`          | `cadeia`         | `cadeia`       | `"Oi" + " mundo"`                   | `"Oi mundo"`              |
| `cadeia`          | `caracter`       | `cadeia`       | `"Banan" + 'a'`                     | `"Banana"`                |
| `cadeia`          | `inteiro`        | `cadeia`       | `"Faz um " + 21`                    | `"Faz um 21"`             |
| `cadeia`          | `real`           | `cadeia`       | `"Altura: " + 1.78`                 | `"Altura: 1.78"`          |
| `cadeia`          | `logico`         | `cadeia`       | `"Help bom =" + verdadeiro`         | `"Help bom = verdadeiro"` |
| `caracter`        | `cadeia`         | `cadeia`       | `'P' + "anqueca"`                   | `"Panqueca"`              |
| `caracter`        | `caracter`       | `cadeia`       | `'C' + 'a' + 'd' + 'e' + 'i' + 'a'` | `"Cadeia"`                |
| `inteiro`         | `cadeia`         | `cadeia`       | `22 + " de agosto"`                 | `"22 de agosto"`          |
| `inteiro`         | `inteiro`        | `inteiro`      | `12 + 34`                           | `46`                      |
| `inteiro`         | `real`           | `real`         | `76 + 3.25`                         | `79.25`                   |
| `real`            | `cadeia`         | `cadeia`       | `3.24 + " Kg"`                      | `"3.24 Kg"`               |
| `real`            | `inteiro`        | `real`         | `9.87 + 1`                          | `10.87`                   |
| `real`            | `real`           | `real`         | `9.87 + 0.13`                       | `10.0`                    |
| `logico`          | `cadeia`         | `cadeia`       | `verdadeiro + " amigo"`             | `"verdadeiro amigo"`      |

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo de Sintaxe"
programa {
  funcao inicio() {
    inteiro valor

    escreva(5 + 8, "\n")

    valor = 5 + 8

    escreva(valor)
  }
}
```
