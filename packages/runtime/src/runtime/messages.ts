// As mensagens dos erros de execução do Portugol Studio, com as explicações e os exemplos dele:
// as classes em `br.univali.portugol.nucleo.execucao.erros.mensagens`. O texto é o mesmo, com
// os erros de digitação corrigidos; os programas de exemplo seguem o formato do Webstudio (dois
// espaços, chaves na mesma linha). Ficam aqui, e não no texto do runtime, para cada linha ser
// escrita uma vez, sem escapes duplos.

/**
 * Um índice fora de um vetor ou de uma matriz (`ErroIndiceInvalido`).
 */
export const INVALID_INDEX_MESSAGE = [
  "Você tentou acessar um índice de vetor ou matriz inválido.",
  "",
  "No caso dos vetores, o índice deve ser menor que o número de elementos que o vetor possui.",
  "Por exemplo, se foi declarado um vetor com 5 elementos (inteiro vetor[5]), o maior índice possível é 4.",
  "",
  "No caso das matrizes, o índice utilizado para acessar a linha da matriz deve ser menor que a quantidade de linhas que ela possui.",
  "Da mesma forma, o índice utilizado para acessar a coluna da matriz deve ser menor que a quantidade de colunas que ela possui.",
  "",
  "Por exemplo, se foi declarada uma matriz com 3 linhas e 8 colunas (inteiro matriz[3][8]), o maior índice possível para a linha é 2 e o maior índice possível para a coluna é 7.",
  "",
  "Além disso, o índice de um vetor ou matriz não pode ser negativo. Portanto, todos os comandos abaixo são inválidos e geram erro na execução do programa:",
  "",
  "programa {",
  "  funcao inicio() {",
  "    inteiro vetor[6]",
  "    inteiro matriz[5][4]",
  "",
  "    escreva(vetor[-1])",
  "    escreva(matriz[-1][2])",
  "    escreva(matriz[3][-1])",
  "    escreva(matriz[-1][-1])",
  "  }",
  "}",
  "",
].join("\n");

/**
 * Uma função que chama a si mesma sem parar (`ErroEstouroPilha`).
 */
export const STACK_OVERFLOW_MESSAGE = [
  "Ocorreu um estouro de pilha de memória no programa.",
  "Isto significa que existe alguma função do programa que está sendo chamada de forma recursiva sem uma condição de parada.",
  "",
  'O código abaixo, por exemplo, gera um estouro de pilha, pois a função "teste" chama ela mesma para sempre:',
  "",
  "programa {",
  "  inteiro contador = 0",
  "",
  "  funcao inicio() {",
  "    teste()",
  "  }",
  "",
  "  funcao teste() {",
  "    contador = contador + 1",
  "",
  '    escreva("Teste " + contador + "\\n")',
  "",
  "    teste()",
  "  }",
  "}",
  "",
  'Neste exemplo, o problema pode ser resolvido criando uma condição que impeça a função "teste" de ser chamada para sempre:',
  "",
  "programa {",
  "  inteiro contador = 0",
  "",
  "  funcao inicio() {",
  "    teste()",
  "  }",
  "",
  "  funcao teste() {",
  "    contador = contador + 1",
  "",
  '    escreva("Teste " + contador + "\\n")',
  "",
  "    se (contador < 100) {",
  "      teste()",
  "    }",
  "  }",
  "}",
  "",
].join("\n");
