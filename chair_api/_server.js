const WebSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer(function (request, response){});

server.listen(1312, function () {
    console.log('Server listens on localhost:1312');
});

// create the server
const wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function (request) {

    const connection = request.accept(null, request.origin);
    console.log('connection opened');

    // send the data to the client
    connection.send(JSON.stringify('connected'));
    connection.send(JSON.stringify({id: 1, motionType: 'Rotation', velocity: 0.5}));
    connection.send(JSON.stringify({id: 1, motionType: 'Straight', velocity: 5}));
    connection.send(JSON.stringify({id: 2, motionType: 'Straight', velocity: 1.25}));
    connection.send(JSON.stringify({id: 1, system: 'stop'}));

    connection.on('close', function (connection) {
        console.log('connection closed');
    });
});