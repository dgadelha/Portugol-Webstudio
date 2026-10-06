# Declaração de Matriz

Para a melhor compreensão do conceito de matriz, é interessante o entendimento de Vetores. Os vetores permitem solucionar uma série de problemas onde é necessário armazenamento de informações, porém eles possuem a restrição de serem lineares. Por exemplo, imagine que queremos armazenar três notas obtidas por quatro alunos diferentes. Neste caso, existe outra estrutura mais adequada para armazenar os dados. A matriz.

A matriz é definida como sendo um vetor com mais de uma dimensão (geralmente duas). Enquanto o vetor armazena as informações de forma linear, a matriz armazena de forma tabular (com linhas e colunas).

A tabela a seguir ilustra uma matriz que armazena três notas de quatro alunos:

| Posições | 0   | 1   | 2   |
| -------- | --- | --- | --- |
| **0**    | 10  | 9   | 6.7 |
| **1**    | 6   | 8   | 10  |
| **2**    | 8   | 7   | 4.5 |
| **3**    | 5.2 | 3.3 | 0.3 |

Repare que cada linha da matriz representa um aluno que tem três notas (três colunas).

Assim como o vetor, a matriz também possui todos os elementos de um mesmo tipo. Na declaração de uma matriz temos sempre que indicar respectivamente o tipo de dado, nome da variável, número de linhas e colunas (nesta ordem) entre colchetes.

Para fazer acesso a um elemento da matriz, seja para preencher ou para consultar o valor, devemos indicar dois índices, um para a linha e outro para a coluna. O índice é um valor inteiro (pode ser constante ou uma variável) que aparece sempre entre colchetes "\[ \]" após o nome da matriz.

```portugol sintaxe title="Exemplo de Sintaxe"
// Declaração de uma matriz de números reais com 5 linhas e 3 colunas
real nome_da_variavel[5][3]
// Gravar um valor na matriz na posição 0 (primeira linha) e 1 (segunda coluna)
nome_da_variavel[0][1] = 2.5
```

Da mesma forma que o vetor, tentar acessar um índice fora do tamanho declarado irá gerar um erro de execução.

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    // Declaração de uma matriz de inteiros
    // de duas linhas e duas colunas já inicializada.
    inteiro matriz[2][2] = {{15, 22}, {10, 11}}

    // Atribui -1 na primeira linha e segunda
    // coluna da matriz.
    matriz[0][1] = -1

    // Imprime o valor 15 correspondente
    // a primeira linha e primeira coluna da matriz.
    inteiro i = 0
    escreva(matriz[i][0])
    escreva("\n")

    // Imprime o valor 11 correspondente
    // a última linha e última coluna da matriz.
    escreva(matriz[1][1])

    // Declaração de uma matriz de reais de
    // duas linhas e quatro colunas.
    real outra_matriz[2][4]

    // Declaração de uma matriz de caracteres onde o tamanho
    // de linhas e colunas são definidos pela inicialização
    caracter jogo_velha[][] = {
      {'X', 'O', 'X'},
      {'O', 'X', 'O'},
      {' ', ' ', 'X'}
    }
  }
}
```
