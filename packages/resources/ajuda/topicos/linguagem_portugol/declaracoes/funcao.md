# Declaração de Função

Se lhe fosse solicitado um algoritmo para preencher uma matriz, você o resolveria, correto? Porém, se ao invés de uma matriz fossem solicitadas dez matrizes? Concordamos que o algoritmo ficaria muito cansativo e repetitivo. Mas, e se pudéssemos repetir o mesmo procedimento, quantas vezes necessário, escrevendo-o apenas uma vez? Nós podemos. Para isso, usamos uma função. Função consiste em uma porção de código que resolve um problema muito específico, parte de um problema maior.

Algumas das vantagens na utilização de funções durante a programação são:

- A redução de código duplicado num programa;
- A possibilidade de reutilizar o mesmo código sem grandes alterações em outros programas;
- A decomposição de problemas grandes em pequenas partes;
- Melhorar a interpretação visual de um programa;
- Esconder ou regular uma parte de um programa, mantendo o restante código alheio às questões internas resolvidas dentro dessa função;

Os componentes de uma função são:

- O seu protótipo, que inclui os parâmetros que são passados à função na altura da invocação;
- O corpo, que contém o bloco de código que resolve o problema proposto;
- Um possível valor de retorno, que poderá ser utilizado imediatamente a seguir à invocação da função.

A declaração de função no Portugol é realizada da seguinte forma: Deve-se utilizar a palavra reservada `funcao`, seguida do tipo de retorno. Quando o tipo de retorno é ocultado, o Portugol assume que o retorno é do tipo vazio. Então, deve-se definir o nome da função seguido de abre parênteses, uma lista de parâmetros pode ser incluída antes do fecha parênteses. Para concluir a declaração deve-se criar o corpo da função. O corpo da função consiste em estruturas dentro do abre e fecha chaves. Quando uma função possui um tipo de retorno diferente de vazio, é obrigatória a presença do comando retorne no corpo da função.

```portugol sintaxe title="Exemplo de Sintaxe"
funcao real nome_da_funcao(inteiro parametro1, real parametro2) {
  retorne parametro1 * parametro2
}

funcao inteiro nome_da_funcao2() {
  retorne 1
}

funcao nome_da_funcao3(cadeia &parametro) {
  parametro = "Novo Valor"
}
```

A declaração dos parâmetros é similar à declaração de variável, vetor e matriz sem inicialização e devem ser separados por vírgula. Note que uma função do tipo vazio não tem retorno.

Para funções existem dois tipos de passagens de valores possíveis. São eles: por valor e por referência. A passagem de parâmetros por valor transfere para a função apenas o valor contido na variável, ou seja, a variável em si não terá seu conteúdo alterado. Já a passagem de parâmetro por referência transfere a variável como um todo, modificando a mesma de acordo com os comandos presentes no corpo da função.

Por padrão, os parâmetros se comportam como passagem por valor. Para o parâmetro se comportar como referência, deve-se adicionar o símbolo & antes do nome do parâmetro.

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  // Função com retorno do tipo vazio sem parâmetro
  funcao vazio imprime_linha() {
    escreva("\n-----------------------------\n")
  }

  // Função com retorno do tipo vazio
  funcao inicio() {
    // Imprime o retorno da função media
    escreva(media(4, 9, 8))

    imprime_linha()

    inteiro variavel = 123

    zera_valor(variavel)

    // Imprime 0
    escreva(variavel)

    imprime_linha()

    inteiro num = 3

    // Verifica se o número 3 é par com uma resposta do tipo lógico
    escreva(num, " é par? ", verifica_par(num))
  }

  // Função com retorno do tipo real e três parâmetros do tipo inteiro
  funcao real media(inteiro m1, inteiro m2, inteiro m3) {
    retorne (m1 * 2 + m2 * 3 + m3 * 8) / 13.0
  }

  // Função com retorno vazio e parâmetro por referência
  funcao zera_valor(inteiro &valor) {
    valor = 0
  }

  // Função com retorno do tipo lógico e parâmetro do tipo real
  funcao logico verifica_par(inteiro num) {
    se (num % 2 != 0) {
      retorne falso
    }

    retorne verdadeiro
  }
}
```
