/*
 This Websocket Server communicates with
 the front-end application. It sends the
 current positions of the chairs and
 revives commands for them.
 */

const WebSocketServer = require('websocket').server;
const http = require('http');

const httpServer = http.createServer(function (request, response) {
});


httpServer.listen(6969, function () {
    console.log('Server listens on localhost:1312');
});

// Initialize the server
const wsServer = new WebSocketServer({
    httpServer: httpServer
});

let server = wsServer.on('request', function (request) {

    let connection = request.accept(null, request.origin);
    console.log('connection opened');
    // When connected, Send welcome message to client
    connection.send('hello my dear friend');

    // When reviving a message
    connection.on('message', function incoming(data) {
        let message;

        console.log('> %s', data);
        try {
            message = JSON.parse(data);
        } catch (e) {
            console.log('No JSON given');
        }

        if (typeof message !== 'undefined') {
            /*
                Interpret message
             */
        }

        // When connection gets closed
        connection.on('close', function (connection) {
            console.log('closed connection', connection);
            /*
                Things to do when connection was lost.
            */
        });
    });
});


/*
    MOCK API
    Sends commands to client (index 0)
    after a short timeout.
*/
setTimeout(function () {
    server.connections[0].send(JSON.stringify({
        id: 1,
        position: {
            x: 152,
            y: 365,
            bearing: 75
        }
    }));
}, 3000);