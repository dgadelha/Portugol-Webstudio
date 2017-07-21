module.exports = function(io) {
  var fs = require('fs');
  var pty = require('pty.js');
  io.on('connection', function(socket) {
    /*
    Usuário se conectou então nós criamos o terminal e definimos a trava (listen)
    */
    var listen = false;
    var term = pty.spawn('./libs/runtime/linux/runtime', [""], {
      name: 'xterm',
      cols: 80,
      rows: 30,
      cwd: require('path').dirname(require.main.filename) + "/../",
      env: process.env
    });
    // Arquivo temporário onde o código do portugol será armazenado
    var file = "libs/runtime/__temp/" + Math.random().toString(12).substring(7) + ".por";

    /*
    socket.on(input):
    trigger responsável por receber o código do portugol, escrever no arquivo temporário e passar para o RUNTIME
    */
    socket.on("input", function(code) {
      // Verifica se a trava está ativa e o código está ouvindo inputs do usuário. Se estiver ativa, emite a mensagem indicando para aguardar
      if (!listen) {
        var data = new Date(); // Autoexplicativo
        var hora = (data.getHours() < 10 ? "0" : "") + data.getHours();
        var minutos = (data.getMinutes() < 10 ? "0" : "") + data.getMinutes();
        var segundos = (data.getSeconds() < 10 ? "0" : "") + data.getSeconds();
        socket.emit('output', "Iniciando compilação... (" + hora + ":" + minutos + ":" + segundos + ")\n"); // Envia mensagem dizendo que vai compilar
        fs.writeFile(__dirname + "/../" + file, code, function(err) {}); // Escrevemos o código em portugol temporariamente
        term.write("~|^!+RUNTIME+!^|~" + file + "\r"); // Indicamos qual arquivo o RUNTIME deve ler
      } else {
        socket.emit('output', "\nAguarde o fim da execução!");
      }
    });
    /*
    socket.on(response):
    trigger resposável por receber quaisquer respostas que o usuário precisar enviar para o código
    */
    socket.on("response", function(resp) {
      if (listen) {
        resp = resp.replace(new RegExp("~|^!+", "g"), "").replace(new RegExp("+!^|~", "g"), ""); // Filtro de palavras reservadas
        term.write(resp + "\r"); // Escreve input para o console virtual
      }
    });
    /*
    term.on(data):
    trigger que é ativado quando existe movimentação de texto no console virtual.
    É responsável por escrever de volta as informações por console, e determinar a trava de leitura e escrita.
    */
    term.on('data', function(data) {
      data = data.replace("~|^!+INPUT+!^|~", ""); // Filtro de palavra reservada descontinuada
      //console.log(data + " = " + data.indexOf("~|^!+START+!^|~"))
      if (listen) { // Verifica se está executando alguma coisa
        // Portugol está sendo executado no console
        if (data.includes("~|^!+END+!^|~")) { // Verifica se RUNTIME indicou que execução acabou
          // RUNTIME indicou que execução acabou
          listen = false; // Define que não está executando (ouvindo) nada
          socket.emit('hide-response', ""); // Desliga input de resposta
          socket.emit('output', "Execução terminou.\n");
        } else {
          // Execução não acabou
          socket.emit('output', data); // Emite para o cliente o texto do console
        }
      } else if (data.includes("~|^!+START+!^|~")) { // Não está executando nada, ainda, então verifica se o RUNTIME indica que a execução começou
        // Execução começou
        listen = true; // Define que está sendo executado e NodeJS deve ficar no aguardo
        socket.emit('show-response', ""); // Liga input de resposta
      }
    });


    // Espera por um pedido de redimensionamento e atualiza tamanho do terminal
    socket.on('resize', function(data) {
      term.resize(data[0], data[1]);
    });

    /*
    socket.on(disconnect):
    Quando usuário desconecta, destroi o console e elimina o arquivo temporário, caso o RUNTIME não tenha deletado ainda
    */
    socket.on("disconnect", function() {
      if (fs.existsSync(__dirname + "/../" + file)) {
        fs.unlinkSync(__dirname + "/../" + file);
        console.log('Found file');
      }
      term.destroy();
      console.log("bye");
    });

  });
}
