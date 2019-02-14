/*
    This script runs on
    all chairs
 */
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: 1312});

wss.on('connection', function connection(ws) {
    ws.send('chair 1 ready');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        /*
            Put all interpretation of commands here.
         */
    });

    ws.on('close', function (data) {
        console.log('closed connection', data);
        /*
            Things to do when connection was lost.
            Like stopping the chair or so.
        */
    });
});
