# Tipo Caracter

Em determinadas situações faz-se necessário o uso de símbolos, letras ou outro tipo de conteúdo. Por exemplo, em um jogo da velha, seriam necessárias variáveis que tivessem conteúdos de 'X' e 'O'. Para este tipo de situação, existe a variável do tipo `caracter`. A variável do tipo caracter é aquela que contém uma informação composta de apenas UM caractere alfanumérico ou especial. Exemplos de caracteres são letras, números, pontuações etc.

A sintaxe é a palavra reservada `caracter` e em seguida um nome para a variável.

```portugol sintaxe title="Exemplo de Sintaxe"
caracter nome_da_variavel
```

O valor que essa variável assumirá poderá ser especificado pelo programador ou solicitado ao usuário (ver Operação de Atribuição). Caso seja especificado pelo programador, o conteúdo deve estar acompanhado de aspas simples.

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo de Sintaxe"
programa {
  funcao inicio() {
    caracter vogal, consoante
    vogal = 'a' // Variável declarada através de atribuição do programador

    escreva("Digite uma consoante: ")
    leia(consoante) // Variável declarada através de entrada do usuário

    escreva("Vogal: ", vogal, "\n", "Consoante: ", consoante)
  }
}
```
