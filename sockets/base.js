module.exports = function (io){
  var fs = require('fs');
  var pty = require('pty.js');
  io.on('connection', function(socket){
    var listen = false;
    var term = pty.spawn('python', ["libs/runtime.py"], {
      name: 'xterm',
      cols: 80,
      rows: 30,
      cwd: require('path').dirname(require.main.filename) + "/../",
      env: process.env
    });
    var file = "libs/__temp/"+ Math.random().toString(12).substring(7) +".por";
    // Create terminal
    socket.on("input", function(data){
      if(!listen){
      fs.writeFile(file, data, function(err){}); // Escrevemos o código em portugol temporariamente
      term.write("~|^!+RUNTIME+!^|~" + file + "\r");
      }else{
        socket.emit('output', "\nAguarde o fim da execução!");
      }
    });

    socket.on("response", function(resp){
      if(listen){
        term.write(resp + "\r");
      }
    });
    // Listen on the terminal for output and send it to the client
    term.on('data', function(data){
      data = data.replace("~|^!+INPUT+!^|~", "");
      //console.log(data + " = " + data.indexOf("~|^!+START+!^|~"))
      if(listen){
        if(data.includes("~|^!+END+!^|~")){
          listen = false;
          socket.emit('hide-response', "");
        }else{
          socket.emit('output', data);
        }
      }else if(data.includes("~|^!+START+!^|~")){
        listen = true;
        socket.emit('show-response', "");
      }
    });


    // Listen for a resize request and update the terminal size
    socket.on('resize', function(data){
      term.resize(data[0], data[1]);
    });

    // When socket disconnects, destroy the terminal
    socket.on("disconnect", function(){
      if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log('Found file');
      }
      term.destroy();
      console.log("bye");
    });

  });
}
