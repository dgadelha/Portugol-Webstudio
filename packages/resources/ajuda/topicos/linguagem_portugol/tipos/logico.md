# Tipo Lógico

Em determinadas situações faz-se necessário trabalhar com informações do tipo verdadeiro e falso. Este tipo de necessidade aparece muito em operações relacionais para exibir se determinada condição é verdadeira ou falsa. Por exemplo: como poderíamos verificar se um número digitado pelo usuário é maior que zero? Através de uma variável do tipo `logico`. Uma variável do tipo `logico` é aquela que contém um tipo de dado, usado em operações lógicas, que possui somente dois valores, que são considerados pelo Portugol como verdadeiro e falso.

A declaração de uma variável do tipo `logico` é simples. A sintaxe é a palavra reservada `logico` seguida do nome da variável.

```portugol sintaxe title="Exemplo de Sintaxe"
logico nome_da_variavel
```

O valor que essa variável assumirá poderá ser especificado pelo programador ou solicitado ao usuário (ver Operação de Atribuição). Lembrando que em ambos os casos a variável só assume valores verdadeiro ou falso.

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    logico teste
    inteiro num

    escreva("Digite um valor para ser comparado :")
    leia(num)

    teste = (num > 0)

    escreva("O número digitado é maior que zero? ", teste)
  }
}
```
