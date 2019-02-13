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
            setTimeout(function () {
                ws.send(JSON.stringify(chair1Arrived));
                ws.send(JSON.stringify(chair2Arrived));
            }, 3000);

            setTimeout(function () {
                ws.send(JSON.stringify(chair3Arrived));
                ws.send(JSON.stringify(chair4Arrived));
            }, 4000);
        } catch (e) {
            console.log('No JSON given', '\n');
        }
    });

    setTimeout(function () {
        ws.send('f1');
    }, 1000);

    ws.on('close', function (data) {
        console.log('closed connection', data, '\n');
    });
});

// Unnötiger stuff
const chair1Arrived = {
    id: 1,
    arrived: true
};
const chair2Arrived = {
    id: 2,
    arrived: true
};
const chair3Arrived = {
    id: 3,
    arrived: true
};
const chair4Arrived = {
    id: 4,
    arrived: true
};