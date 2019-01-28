const WebSocketServer = require('websocket').server;
const http = require('http');

let positionData = [
    {
        id: 0,
        position: {
            x: 100,
            y: 100,
            bearing: 0
        }
    },
    {
        id: 1,
        position: {
            x: 100,
            y: 200,
            bearing: 0
        }
    },
    {
        id: 2,
        position: {
            x: 500,
            y: 400,
            bearing: 0
        },
    },
    {
        id: 3,
        position: {
            x: 100,
            y: 400,
            bearing: 0
        }
    }
]

const server = http.createServer(function(request, response) {});

server.listen(3000, function() {
    console.log('Server listens on localhost:3000');
});

// create the server
const wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {

    const connection = request.accept(null, request.origin);
    console.log('connection opened');

    // send the data to the client
    connection.send(JSON.stringify(positionData));

    connection.on('close', function(connection) {
        console.log('connection closed');
    });
});