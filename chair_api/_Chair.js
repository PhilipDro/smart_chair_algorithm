const WebSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer(function (request, response) {
});

class Chair {
    constructor() {
        server.listen(1312, function () {
            console.log('Server listens on localhost:1312');
        });

        // Initialize the server
        const wsServer = new WebSocketServer({
            httpServer: server
        });

        // WebSocket server logic
        // Add the WebSocket server to 'this',
        // so every method can use it
        this.wsServer = wsServer.on('request', function (request) {

            let connection = request.accept(null, request.origin);
            console.log('connection opened');

            connection.send(JSON.stringify({id: 0, system: 'connected'}));

            connection.on('close', function (connection) {
                console.log('connection closed');
            });
        });
    }


    move(chairId, command) {
        this.wsServer.connections[chairId].send(JSON.stringify(command));
    }

    stop(chairId) {
        this.wsServer.connections[chairId].send(JSON.stringify({id: chairId, system: 'stop'}));
    }
}


const chair = new Chair();

setTimeout(function () {
    chair.move(0, {id: 0, motionType: 'Rotation', velocity: 0.5});
    chair.stop(0);
    //chair.stop(1); todo: we dont broadcast commands so abklären mit marcel und henry
}, 3000);