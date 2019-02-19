const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 9898});

wss.on('connection', function connection(ws) {
    console.log('connection opened');

    ws.on('message', function incoming(message) {
        console.log(">", message);
        /*
            Broadcast to everyone but the sender.
         */
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    /*
        Handle connection closings
     */
    ws.on('close', function (data) {
        console.log('closed connection', data, '\n');
    });
});

