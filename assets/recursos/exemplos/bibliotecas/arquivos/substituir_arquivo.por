/*
 * Copyright (C) 2018 - UNIVALI - Universidade do Vale do Itajaí
 *
 * Este arquivo de código fonte é livre para utilização, cópia e/ou modificação
 * desde que este cabeçalho, contendo os direitos autorais e a descrição do programa,
 * seja mantido.
 *
 * Se tiver dificuldade em compreender este exemplo, acesse as vídeoaulas do Portugol
 * Studio para auxiliá-lo:
 *
 * https://www.youtube.com/watch?v=K02TnB3IGnQ&list=PLb9yvNDCid3jQAEbNoPHtPR0SWwmRSM-t
 *
 * Descrição:
 *
 *  Exemplo de como substituir o texto de dentro de um arquivo por outro.
 *
 *
 * Autores:
 *
 *   Adson Marques da Silva Esteves (shinadson@gmail.com)
 *
 * Data: 30/01/2018
 */

programa {
  inclua biblioteca Arquivos --> a

  funcao inicio() {
    // Para substituir texto dentro de um arquivo, primeiro vamos escrever um arquivo de texto.
    // Abrimos um arquivo em modo de escrita e escrevemos algumas coisas nele
    inteiro endereco = a.abrir_arquivo("dummyText.txt", a.MODO_ESCRITA)

    a.escrever_linha("O portugol é uma IDE muito maneira", endereco)
    a.escrever_linha("O portugol contém vários exemplos interessantes", endereco)
    a.escrever_linha("O portugol é realizado no LITE", endereco)

    a.fechar_arquivo(endereco)

    // Agora vamos imprimir o texto do arquivo para ver se foi tudo escrito corretamente
    escreva("\n texto original \n")
    endereco = a.abrir_arquivo("dummyText.txt", a.MODO_LEITURA)

    enquanto (nao a.fim_arquivo(endereco)) {
      escreva(a.ler_linha(endereco) + "\n")
    }

    a.fechar_arquivo(endereco)

    // Uma vez confirmado o texto, substituiremos algumas partes desse texto por outras com a função "substituir_texto".
    // Ela pode tanto substituir todas as ocorrências de um texto
    // quanto substituir apenas a primeira ocorrência do texto.
    // Isso será definido pelo último parâmetro da função:
    // caso verdadeiro, apenas a primeira ocorrência;
    // caso falso, todas as ocorrências

    // A seguinte função substituirá no arquivo de texto a palavra "portugol"
    // por "Portugol Studio", em todas as ocorrências
    a.substituir_texto("dummyText.txt", "portugol", "Portugol Studio", falso)
    // A seguinte função substituirá no arquivo de texto a palavra "é"
    // por "retrata", apenas na primeira ocorrência
    a.substituir_texto("dummyText.txt", "é", "retrata", verdadeiro)

    // Em seguida, imprimiremos o texto do arquivo novamente, para podermos comparar os casos
    escreva("\n texto modificado \n")

    endereco = a.abrir_arquivo("dummyText.txt", a.MODO_LEITURA)

    enquanto (nao a.fim_arquivo(endereco)) {
      escreva(a.ler_linha(endereco) + "\n")
    }

    a.fechar_arquivo(endereco)
  }
}
