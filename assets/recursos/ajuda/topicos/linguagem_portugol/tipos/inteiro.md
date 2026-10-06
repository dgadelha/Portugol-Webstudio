# Tipo Inteiro

Em determinadas situações faz-se necessário a utilização de valores inteiros em um algoritmo. Como faríamos, por exemplo, uma simples soma entre dois números pertencentes ao conjunto dos números inteiros? Simples. Utilizando variáveis do tipo `inteiro`. Uma variável do tipo inteiro pode ser entendida como uma variável que contém qualquer número que pertença ao conjunto dos números inteiros. Podem ser positivos, negativos ou nulos.

A declaração de uma variável do tipo `inteiro` é simples.

A sintaxe é a palavra reservada `inteiro` e em seguida um nome para a variável.

```portugol sintaxe title="Exemplo de Sintaxe"
inteiro nome_da_variavel
```

O valor que essa variável assumirá poderá ser especificado pelo programador ou solicitado ao usuário (ver Operação de Atribuição).

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    inteiro num1, num2
    num1 = 5
    num2 = 3
    escreva(num1 + num2)
  }
}
```
