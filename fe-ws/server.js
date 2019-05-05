const WebSocket = require('ws');

const PORT = 9898;

const wss = new WebSocket.Server({port: PORT});

/**
 * Listening event
 */
wss.on('listening', function () {
    console.log(`Server listens on port ${PORT}...`);
});

/**
 * Connection event
 */
wss.on('connection', function connection(ws) {
    console.log('connection opened');
    /**
     * Incoming message event
     */
    ws.on('message', function incoming(message) {
        console.log(">>>>", message);
        /**
         *  Broadcast to everyone but the sender.
         */
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    /**
     * Handle connection closings
     */
    ws.on('close', function (data) {
        console.log('closed connection', data, '\n');
    });
});

