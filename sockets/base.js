module.exports = function (io){
  var fs = require('fs');
  var pty = require('pty.js');
  io.on('connection', function(socket){
    // Create terminal
    var term = pty.spawn('sh', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env
    });
    // Listen on the terminal for output and send it to the client
    term.on('data', function(data){
      socket.emit('output', data);
    });

    // Listen on the client and send any input to the terminal
    socket.on('input', function(data){
      term.write(data);
    });

    // Listen for a resize request and update the terminal size
    socket.on('resize', function(data){
      term.resize(data[0], data[1]);
    });

    // When socket disconnects, destroy the terminal
    socket.on("disconnect", function(){
      term.destroy();
      console.log("bye");
    });
  });
}
