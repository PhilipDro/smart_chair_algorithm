const WebSocketServer = require('websocket').server;
const http = require('http');

let positionData =
    {
        id: 0,
        x: 100,
        y: 100,
        bearing: 0
    };

const server = http.createServer(function (request, response) {
});

server.listen(3000, function () {
    console.log('Server listens on localhost:3000');
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
    console.log(positionData);
    connection.send(JSON.stringify(positionData));


    connection.on('close', function (connection) {
        console.log('connection closed');
    });
});