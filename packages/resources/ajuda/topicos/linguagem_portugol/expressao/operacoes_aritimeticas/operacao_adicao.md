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

| Operando Esquerdo | Operando Direito | Tipo Resultado | Exemplo                      | Resultado           |
| ----------------- | ---------------- | -------------- | ---------------------------- | ------------------- |
| `cadeia`          | `cadeia`         | `cadeia`       | `"Oi" + " mundo"`            | `"Oi mundo"`        |
| `cadeia`          | `caracter`       | `cadeia`       | `"Banan" + 'a'`              | `"Banana"`          |
| `cadeia`          | `inteiro`        | `cadeia`       | `"Faz um " + 21`             | `"Faz um 21"`       |
| `cadeia`          | `real`           | `cadeia`       | `"Altura: " + 1.78`          | `"Altura: 1.78"`    |
| `cadeia`          | `logico`         | `cadeia`       | `"Help bom = " + verdadeiro` | `"Help bom = true"` |
| `caracter`        | `cadeia`         | `cadeia`       | `'P' + "anqueca"`            | `"Panqueca"`        |
| `caracter`        | `caracter`       | `inteiro`      | `'C' + 'a'`                  | `164`               |
| `inteiro`         | `cadeia`         | `cadeia`       | `22 + " de agosto"`          | `"22 de agosto"`    |
| `inteiro`         | `inteiro`        | `inteiro`      | `12 + 34`                    | `46`                |
| `inteiro`         | `real`           | `real`         | `76 + 3.25`                  | `79.25`             |
| `real`            | `cadeia`         | `cadeia`       | `3.24 + " Kg"`               | `"3.24 Kg"`         |
| `real`            | `inteiro`        | `real`         | `9.87 + 1`                   | `10.87`             |
| `real`            | `real`           | `real`         | `9.87 + 0.13`                | `10.0`              |
| `logico`          | `cadeia`         | `cadeia`       | `verdadeiro + " amigo"`      | `"true amigo"`      |

Note que:

- Ao ser concatenado com uma cadeia, um valor lógico aparece como `true` ou `false`, e não como `verdadeiro` ou `falso`, que é o que o comando `escreva` exibe quando recebe o valor sozinho.
- A soma de dois caracteres não junta os caracteres: o resultado é um número inteiro, a soma dos códigos de cada caractere (`'C'` tem o código 67 e `'a'`, o código 97). Para juntar caracteres em uma cadeia, comece a expressão com uma cadeia, já que a adição é feita da esquerda para a direita: `"" + 'C' + 'a'` resulta em `"Ca"`, mas `'C' + 'a' + ""` resulta em `"164"`.

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
