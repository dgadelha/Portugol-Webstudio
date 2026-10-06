# Linguagem Portugol

Uma linguagem de programação é um método padronizado para comunicar instruções para um computador. É um conjunto de regras sintáticas e semânticas usadas para definir um programa de computador. Permite que um programador especifique precisamente sobre quais dados um computador vai atuar, como estes dados serão armazenados ou transmitidos e quais ações devem ser tomadas sob várias circunstâncias.

O Portugol é uma representação que se assemelha bastante com a linguagem C, porém é escrito em português. A ideia é facilitar a construção e a leitura dos algoritmos usando uma linguagem mais fácil aos alunos.

---

# Sintaxe e semântica do Portugol

O compilador auxilia a verificar se a sintaxe e a semântica de um programa estão corretas.

Durante os tópicos da ajuda, serão apresentadas as estruturas básicas da linguagem.

## Exemplo da estrutura básica

```portugol exemplo title="Exemplo"
// O comando programa é obrigatório
programa {
  // Inclusões de bibliotecas
  //  - Quando houver a necessidade de utilizar
  //    uma ou mais bibliotecas, as inclusões
  //    devem aparecer antes de qualquer declaração

  /*
   * Dentro do programa é permitido declarar
   * variáveis globais, constantes globais e
   * funções em qualquer ordem.
   */

  // Declarações de funções somente
  // são permitidas dentro do programa.
  funcao inicio() {
    /*
     * Declarações de variáveis locais,
     * constantes locais, estruturas de
     * controle e expressões.
     */
  }
}
```
