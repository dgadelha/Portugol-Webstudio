import fs from "fs";
import iconv from "iconv-lite";
import * as pty from "node-pty";
import os from "os";
import SocketIo from "socket.io";
import stripAnsi from "strip-ansi";

export default (io: SocketIo.Server) => {
  const shell_location = `${__dirname}/runtime/dist`;
  const shell = `${shell_location}/portugol-runtime${os.platform() === "win32" ? ".exe" : ""}`;

  io.on("connection", socket => {
    // Usuário se conectou então nós criamos o terminal e definimos a trava (listen)
    console.log(`Usuário ${socket.id} conectado!`);

    let listen = false;
    let term: pty.IPty;

    try {
      term = pty.spawn(shell, [""], {
        name: "xterm",
        cols: 80,
        rows: 30,
        cwd: __dirname,
        env: process.env as Record<string, string>,
      });

      // Arquivo temporário onde o código do portugol será armazenado CAMINHO TEM QUE SER ABSOLUTO
      const file = `${shell_location}/temp/${Math.random().toString(12).substring(7)}.por`;

      /**
       * socket.on(input):
       * trigger responsável por receber o código do portugol, escrever no arquivo temporário e passar para o RUNTIME
       */
      socket.on("input", (code: string) => {
        // Verifica se a trava está ativa e o código está ouvindo inputs do usuário. Se estiver ativa, emite a mensagem indicando para aguardar
        if (listen) {
          socket.emit("output", "\nAguarde o fim da execução!");
        } else {
          fs.writeFileSync(file, iconv.encode(code, "ISO-8859-1")); // Escrevemos o código em portugol temporariamente
          term.write(`~|^!+RUNTIME+!^|~${file}\r`); // Indicamos qual arquivo o RUNTIME deve ler
        }
      });

      /**
       * socket.on(response):
       * trigger resposável por receber quaisquer respostas que o usuário precisar enviar para o código
       */
      socket.on("response", (resp: string) => {
        if (listen) {
          const result = resp.replace("~|^!+", "").replace("+!^|~", ""); // Filtro de palavras reservadas

          term.write(`${result.trim()}\n`); // Escreve input para o console virtual
        }
      });

      /**
       * term.onData:
       * trigger que é ativado quando existe movimentação de texto no console virtual.
       * É responsável por escrever de volta as informações por console, e determinar a trava de leitura e escrita.
       */
      term.onData(data => {
        const content = iconv.decode(
          Buffer.from(stripAnsi(data.replace("~|^!+INPUT+!^|~", "")), "latin1"),
          "ISO-8859-1",
        );

        if (listen) {
          /*
           * Verifica se está executando alguma coisa
           * Portugol está sendo executado no console
           */
          if (content.includes("~|^!+END+!^|~")) {
            /*
             * Verifica se RUNTIME indicou que execução acabou
             * RUNTIME indicou que execução acabou
             */
            listen = false; // Define que não está executando (ouvindo) nada
            socket.emit("hide-response", ""); // Desliga input de resposta
            socket.emit("output", content.replace("~|^!+END+!^|~", "\nPrograma finalizado.")); // Emite para o cliente o texto do console
          } else {
            // Execução não acabou
            socket.emit("output", content); // Emite para o cliente o texto do console
          }
        } else if (content.includes("~|^!+START+!^|~")) {
          /*
           * Não está executando nada, ainda, então verifica se o RUNTIME indica que a execução começou
           * Execução começou
           */
          listen = true; // Define que está sendo executado e NodeJS deve ficar no aguardo
          socket.emit("show-response", ""); // Liga input de resposta
        }
      });

      // Espera por um pedido de redimensionamento e atualiza tamanho do terminal
      socket.on("resize", ([width, height]: [number, number]) => {
        term.resize(width, height);
      });

      /**
       * socket.on(disconnect):
       * Quando usuário desconecta, destroi o console e elimina o arquivo temporário, caso o RUNTIME não tenha deletado ainda
       */
      socket.on("disconnect", () => {
        console.log("Usuário desconectado");

        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }

        term.write("~|^!+DIE+!^|~");
        term.write("\x03;\r\x03;\r");
        term.kill();
      });
    } catch (e) {
      console.error(e);

      // declarações para manipular quaisquer exceções
      socket.emit("hide-response", ""); // Desliga input de resposta
      socket.emit(
        "output",
        "\nERRO => Serviço de compilação indisponível no momento! Tente novamente em alguns segundos.",
      ); // passa o objeto de exceção para o manipulador de erro

      listen = false;

      // eslint-disable-next-line
      if (term!) {
        term!.write("~|^!+DIE+!^|~");
        term!.write("\x03;\r\x03;\r");
        term!.kill();
      }
    }
  });
};
