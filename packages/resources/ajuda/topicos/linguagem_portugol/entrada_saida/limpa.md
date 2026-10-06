# Limpa

À medida que um algoritmo está sendo executado ele exibe mensagens e executa ações no console. Assim, em alguns casos o console fica poluído com informações desnecessárias, que atrapalham a compreensão e visualização do programa. Para isso, podemos usar o comando limpa.

O comando limpa é responsável por limpar o console. Não requer nenhum parâmetro e não tem nenhuma saída. Sua sintaxe é simples, e está demonstrada a seguir:

```portugol sintaxe title="Exemplo de Sintaxe"
limpa()
```

Para melhor compreensão deste conceito, confira o exemplo abaixo.

```portugol exemplo title="Exemplo"
programa {
  funcao inicio() {
    cadeia nome

    // Imprime a frase "Qual é o seu nome?"
    escreva("Qual é o seu nome?\n")

    // Detecta o que o usuário escreveu na tela
    leia(nome)

    // Limpa tudo que estava escrito no console
    limpa()

    // Escreve resposta
    escreva("Olá " + nome)
  }
}
```
