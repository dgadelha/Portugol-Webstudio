# Operação de Módulo

Em algumas situações faz-se necessário manipular o resto de algumas divisões. Por exemplo, se você quiser saber se um determinado valor é par ou ímpar, como faria? Para isso podemos utilizar o módulo. A operação módulo encontra o resto da divisão de um número por outro.

Dados dois números a (o dividendo) e b (o divisor), a módulo b (a `%` b) é o resto da divisão de a por b. Por exemplo, `7 % 3` seria `1`, enquanto `9 % 3` seria `0`.

```portugol sintaxe title="Exemplo de Sintaxe"
escreva(13 % 5) // Operação Aritmética 13 % 5 sendo escrita na tela

real numero = 50 % 4 // Operação Aritmética 50 % 4 sendo armazenada na variável numero
```

Note que você poderá atribuir o resultado desta operação a uma variável, ou mesmo executar diretamente através do comando escreva.

## Tabela de compatibilidade de tipos da operação de módulo

| Operando Esquerdo | Operando Direito | Tipo Resultado | Exemplo  | Resultado |
| ----------------- | ---------------- | -------------- | -------- | --------- |
| `inteiro`         | `inteiro`        | `inteiro`      | `45 % 7` | `3`       |

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    inteiro valor

    escreva(7 % 3, "\n")

    valor = 7 % 3

    escreva(valor)
  }
}
```
