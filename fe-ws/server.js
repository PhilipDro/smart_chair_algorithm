const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 9898});

wss.on('connection', function connection(ws) {
    console.log('connection opened');

    ws.on('message', function incoming(message) {
        console.log('received:', message, '\n');

        try {
            let command = JSON.parse(message);
            console.log(command);
            /*
                Chair target command
             */
        } catch (e) {
            console.log('No JSON given', '\n');
        }

        wss.broadcast = function broadcast(message) {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        };

        wss.broadcast(message);

    });


    ws.on('close', function (data) {
        console.log('closed connection', data, '\n');
    });
});

