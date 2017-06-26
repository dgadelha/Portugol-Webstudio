$(document).ready(function() {
    // Use a "/test" namespace.
    // An application can open a connection on multiple namespaces, and
    // Socket.IO will multiplex all those connections on a single
    // physical channel. If you don't care about multiple channels, you
    // can set the namespace to an empty string.
    namespace = '/portugol';
    dev_space = Math.random().toString(12).substring(7);

    // Connect to the Socket.IO server.
    // The connection URL has the following format:
    //     http[s]://<domain>:<port>[/<namespace>]
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    socket.on('connect', function() {
        socket.emit('event', {data: 'Console iniciado!'});
        socket.emit('join_devspace', {room: dev_space});
    });

    // Event handler for server sent data.
    // The callback function is invoked whenever the server emits data
    // to the client. The data is then displayed in the "Received"
    // section of the page.
    socket.on('response', function(msg) {
        $('#log').append('<br>' + $('<div/>').text(msg.data).html());
    });
    // Interval function that tests message latency by sending a "ping"
    // message. The server then responds with a "pong" message and the
    // round trip time is measured.
    var ping_pong_times = [];
    var start_time;
    window.setInterval(function() {
        start_time = (new Date).getTime();
        socket.emit('ping');
    }, 1000);

    // Handler for the "pong" message. When the pong is received, the
    // time from the ping is stored, and the average of the last 30
    // samples is average and displayed.
    socket.on('pong', function() {
        var latency = (new Date).getTime() - start_time;
        ping_pong_times.push(latency);
        ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
        var sum = 0;
        for (var i = 0; i < ping_pong_times.length; i++)
            sum += ping_pong_times[i];
        $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
    });

    // Handlers for the different forms in the page.
    // These accept data from the user and send it to the server in a
    // variety of ways
    $('form#emit').submit(function(event) {
        $("#input_response").css("display", "none");
        socket.emit('my_devspace', {room: dev_space, data: $('#emit_data').val()});
        return false;
    });

});
