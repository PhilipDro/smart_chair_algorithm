const WebSocket = require('ws');
const camera = new WebSocket('ws://localhost:3000');
const frontEnd = new WebSocket.Server({port: 9898});

camera.on('open', function () {
    camera.on('message', function (data) {
        console.log('>', data);
        try {
            let markers = JSON.parse(data);
            console.log('> marker:', markers);
            /*
                Chair target command
             */
        } catch (e) {
            console.log('No JSON given', '\n');
        }

        if (frontEndConnection)
            frontEndConnection.send(event.data);
    });
});


/*

 */
let frontEndConnection;
frontEnd.on('connection', function connection(ws) {
    console.log('connection opened');

    test = ws;
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
    });

    ws.on('close', function (data) {
        console.log('closed connection', data, '\n');
    });
});