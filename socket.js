const fs = require('fs');
const os = require('os');
const iconv = require('iconv-lite');
const pty = require('node-pty-prebuilt');
const stripAnsi = require('strip-ansi');

iconv.skipDecodeWarning = true;

module.exports = io => {
    io.on('connection', socket => {
        /**
         * Usuário se conectou então nós criamos o terminal e definimos a trava (listen)
         */
        console.log('Usuário conectado!');

        let listen = false;
        const shell_location = `${__dirname}/runtime` + (os.platform() === 'win32' ? '/dist/win-x64' : '/dist/debian.8-x64');
        const shell = `${shell_location}/portugol-runtime` + (os.platform() === 'win32' ? '.exe' : '');

        console.log(`Iniciando em ${shell}`);

        const term = pty.spawn(shell, [''], {
            name: 'xterm',
            cols: 80,
            rows: 30,
            cwd: __dirname,
            env: process.env
        });

        // Arquivo temporário onde o código do portugol será armazenado CAMINHO TEM QUE SER ABSOLUTO
        const file = shell_location + '/temp/' + Math.random().toString(12).substring(7) + '.por';

        /**
         * socket.on(input):
         * trigger responsável por receber o código do portugol, escrever no arquivo temporário e passar para o RUNTIME
        */
        socket.on('input', code => {
            // Verifica se a trava está ativa e o código está ouvindo inputs do usuário. Se estiver ativa, emite a mensagem indicando para aguardar
            if (!listen) {
                fs.writeFile(file, iconv.encode(code, 'ISO-8859-1'), _ => {}); // Escrevemos o código em portugol temporariamente
                term.write('~|^!+RUNTIME+!^|~' + file + '\r'); // Indicamos qual arquivo o RUNTIME deve ler
            } else {
                socket.emit('output', '\nAguarde o fim da execução!');
            }
        });

        /**
         * socket.on(response):
         * trigger resposável por receber quaisquer respostas que o usuário precisar enviar para o código
         */
        socket.on('response', resp => {
            if (listen) {
                resp = resp.replace('~|^!+', '').replace('+!^|~', ''); // Filtro de palavras reservadas
                term.write(resp.trim() + '\n'); // Escreve input para o console virtual
            }
        });

        /**
         * term.on(data):
         * trigger que é ativado quando existe movimentação de texto no console virtual.
         * É responsável por escrever de volta as informações por console, e determinar a trava de leitura e escrita.
         */
        term.on('data', data => {
            data = iconv.decode(stripAnsi(data.replace('~|^!+INPUT+!^|~', '')), 'ISO-8859-1');

            //console.log(data + ' = ' + data.indexOf('~|^!+START+!^|~'))
            if (listen) { // Verifica se está executando alguma coisa
                // Portugol está sendo executado no console
                if (data.includes('~|^!+END+!^|~')) { // Verifica se RUNTIME indicou que execução acabou
                    // RUNTIME indicou que execução acabou
                    listen = false; // Define que não está executando (ouvindo) nada
                    socket.emit('hide-response', ''); // Desliga input de resposta
                    socket.emit('output', data.replace('~|^!+END+!^|~', '\nPrograma finalizado.')); // Emite para o cliente o texto do console
                } else {
                    // Execução não acabou
                    socket.emit('output', data); // Emite para o cliente o texto do console
                }
            } else if (data.includes('~|^!+START+!^|~')) { // Não está executando nada, ainda, então verifica se o RUNTIME indica que a execução começou
                // Execução começou
                listen = true; // Define que está sendo executado e NodeJS deve ficar no aguardo
                socket.emit('show-response', ''); // Liga input de resposta
            }
        });

        // Espera por um pedido de redimensionamento e atualiza tamanho do terminal
        socket.on('resize', data => {
            term.resize(data[0], data[1]);
        });

        /**
         * socket.on(disconnect):
         * Quando usuário desconecta, destroi o console e elimina o arquivo temporário, caso o RUNTIME não tenha deletado ainda
         */
        socket.on('disconnect', () => {
            console.log('Usuário desconectado');

            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                console.log('Arquivo temporário removido');
            }

            term.destroy();
        });
    });
}
