# Bibliotecas

Em todo algoritmo que se possa elaborar, existe a possibilidade da utilização de um conjunto de funções e comandos já existentes. A estes conjuntos de funções e comandos, dá-se o nome de Bibliotecas.

As bibliotecas contêm códigos e dados auxiliares, que proveem serviços a programas independentes, o que permite o compartilhamento e a alteração de código e dados de forma modular. Existem diversos tipos de bibliotecas, cada uma com funções para atender a determinados problemas.

Para se utilizar uma biblioteca é necessário primeiro importá-la para o seu programa.

No Portugol, para importar uma biblioteca usam-se as palavras reservadas `inclua biblioteca` seguidas do nome da biblioteca que se deseja usar, e opcionalmente pode-se atribuir um apelido a ela usando o operador "-->" sem aspas seguido do apelido.

Para usar um recurso da biblioteca deve-se escrever o nome da biblioteca (ou apelido), seguido por um ponto e o nome do recurso a ser chamado como demonstrado abaixo.

```portugol sintaxe title="Exemplo de Sintaxe"
inclua biblioteca Matematica
inclua biblioteca Graficos --> g
escreva(Matematica.PI)
g.iniciar_modo_grafico(verdadeiro)
```

No Portugol, existem as seguintes bibliotecas:

- Calendario
- Graficos
- Matematica
- Objetos
- Texto
- Tipos
- Util

```portugol exemplo title="Exemplo"
programa {
  inclua biblioteca Matematica
  inclua biblioteca Texto --> t
  funcao inicio() {
    real resultado
    resultado = Matematica.arredondar(Matematica.PI, 5)
    escreva(resultado)
    escreva(t.caixa_alta("texto"))
  }
}
```
