# Operação de Subtração

Subtração é uma operação matemática que indica quanto é um valor numérico (minuendo) se dele for removido outro valor numérico (subtraendo).

A subtração é o mesmo que a adição por um número de sinal inverso. É, portanto, a operação inversa da adição. Seus elementos estão demonstrados na figura a seguir:

![Imagem explicando como funciona uma subtração](../../../../recursos/imagens/light/operacao_de_subtracao.png)

```portugol sintaxe title="Exemplo de Sintaxe"
escreva(1 - 5) // Operação Aritmética 1 - 5 sendo escrita na tela

real numero = 50 - 30 // Operação Aritmética 50 - 30 sendo armazenada na variável numero
```

Note que você poderá atribuir o resultado desta operação a uma variável, ou mesmo executar diretamente através do comando escreva.

## Propriedades importantes

- **Fechamento** A diferença de dois números reais será sempre um número real.
- **Elemento neutro** Na subtração não existe um elemento neutro **n** tal que, qualquer que seja o real "a", `a - n = n - a = a`.
- **Anulação** Quando o minuendo é igual ao subtraendo, a diferença será 0 (zero).

## Tabela de compatibilidade de tipos da operação de subtração

| Operando Esquerdo | Operando Direito | Tipo Resultado | Exemplo         | Resultado |
| ----------------- | ---------------- | -------------- | --------------- | --------- |
| `inteiro`         | `inteiro`        | `inteiro`      | `20 - 10`       | `10`      |
| `inteiro`         | `real`           | `real`         | `90 - 0.5`      | `89.5`    |
| `real`            | `inteiro`        | `real`         | `11.421 - 3`    | `8.421`   |
| `real`            | `real`           | `real`         | `12.59 - 24.59` | `-12.0`   |

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    inteiro valor

    escreva(10 - 3, "\n")

    valor = 10 - 3

    escreva(valor)
  }
}
```
