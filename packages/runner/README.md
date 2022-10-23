# `@portugol-webstudio/runner`

Este pacote contém o executor de códigos Portugol utilizado pelo Portugol Webstudio.

## Estrutura

A classe `PortugolExecutor` exporta uma interface com as seguintes propriedades:

### Subjects de entrada:

- `stdIn`: um `Subject` onde você pode emitir os eventos do teclado do usuário a serem lidos pelo programa

### Subjects de saída:

- `stdOut$`: um `Subject` onde você pode se inscrever para receber atualizações da saída padrão do programa.

- `running$`: um `Subject` onde você pode se inscrever para receber os eventos de início e fim da execução do programa.

- `waitingForInput$`: um `Subject` onde você pode se inscrever para receber os eventos de espera por entrada do usuário.

- `events$`: um `Subject` onde você pode se inscrever para receber os eventos de execução do programa, dentre eles:

  - `start`: o programa começou a ser executado
  - `clear`: o comando `limpa()` foi executado e a janela de saída foi limpa
  - `stdIn`: o programa está esperando uma entrada do usuário
  - `finish`: o programa terminou de ser executado (inclui a propriedade `time`, que indica quanto tempo o programa ficou em execução, em milissegundos)

### Estado dos subjects de saída:

- `stdOut`: a saída padrão do programa atual em execução.
- `running`: indica se o programa está em execução ou não.
- `waitingForInput`: indica se o programa está esperando uma entrada do usuário ou não.

## Estado dos subjects de entrada:

- `stdInBuffer`: o texto sendo digitado pelo usuário no console de entrada, para ser lido pelo programa (não é necessário manipulá-lo diretamente)

### Métodos:

- `run(code: string)`: executa o código passado como parâmetro. O código deve estar em Portugol, e deve conter uma função `inicio()`.

- `destroy()`: interrompe a execução do programa atual e limpa o estado do executor.

## Exemplo de uso:

```typescript
import { PortugolExecutor, PortugolWebWorkersRunner } from "@portugol-webstudio/runner";

const executor = new PortugolExecutor(PortugolWebWorkersRunner);

executor.stdOut$.subscribe(stdOut => {
  console.log(stdOut);
});

executor.run(`programa {
  funcao inicio() {
    escreva("Olá mundo!")
  }
}`);
```
