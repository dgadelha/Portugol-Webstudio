# Operação de Multiplicação

Na sua forma mais simples a multiplicação é uma forma de se adicionar uma quantidade finita de números iguais. O resultado da multiplicação de dois números é chamado produto. Os números sendo multiplicados são chamados de coeficientes ou operandos, e individualmente de multiplicando e multiplicador, conforme figura abaixo:

![Imagem explicando como funciona uma multiplicação](../../../../recursos/imagens/light/operacao_de_multiplicacao.png)

```portugol sintaxe title="Exemplo de Sintaxe"
escreva(1 * 5) // Operação Aritmética 1 * 5 sendo escrita na tela

real numero = 50 * 30 // Operação Aritmética 50 * 30 sendo armazenada na variável numero
```

Note que você poderá atribuir o resultado desta operação a uma variável, ou mesmo executar diretamente através do comando escreva.

## Propriedades importantes

- **Comutatividade** A ordem dos fatores não altera o resultado da operação. Assim, se `x * y = z`, logo `y * x = z`.
- **Associatividade** O agrupamento dos fatores não altera o resultado (podemos juntá-los de dois em dois de modo que facilite o cálculo). Assim, se `(x * y) * z = w`, logo `x * (y * z) = w`.
- **Distributividade** Um fator colocado em evidência numa soma dará como produto a soma do produto daquele fator com os demais fatores. Assim, `x * (y + z) = (x * y) + (x * z)`.
- **Elemento neutro** O fator 1 (um) não altera o resultado dos demais fatores. O um é chamado "Elemento neutro" da multiplicação. Assim, se `x * y = z`, logo `x * y * 1 = z` (o 0 é o elemento neutro da soma).
- **Elemento opositor** O fator -1 (menos um) transforma o produto em seu simétrico. Assim, `-1 * x = -x` e `-1 * y = -y`, para y diferente de x.
- **Fechamento** O produto de dois números reais será sempre um número do conjunto dos números reais.
- **Anulação** O fator 0 (zero) anula o produto. Assim, `x * 0 = 0`, e `y * 0 = 0`, com x diferente de y.

## Tabela de compatibilidade de tipos da operação de multiplicação

| Operando Esquerdo | Operando Direito | Tipo Resultado | Exemplo         | Resultado  |
| ----------------- | ---------------- | -------------- | --------------- | ---------- |
| `inteiro`         | `inteiro`        | `inteiro`      | `6 * 8`         | `48`       |
| `inteiro`         | `real`           | `real`         | `4 * 1.11`      | `4.44`     |
| `real`            | `inteiro`        | `real`         | `6.712 * 174`   | `1167.888` |
| `real`            | `real`           | `real`         | `207.65 * 1.23` | `255.4095` |

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    inteiro valor

    escreva(3 * 4, "\n")

    valor = 3 * 4

    escreva(valor)
  }
}
```
