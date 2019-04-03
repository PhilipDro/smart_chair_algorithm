const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 1312});

console.log('Server listens on localhost:1312');


wss.on('connection', function connection(ws) {
    console.log('connection opened');
    /*
    Handle incoming messages
     */
    ws.on('message', function incoming(message) {
        console.log(">", message);
        let messageJson = JSON.parse(message);

        /*
        Handle rotation command.
        Sets chair state to busy for a some seconds.
        Then it sets it back to ready and
        sends that.
         */
        if (messageJson.motionType === "Rotation"){
            ws.send(JSON.stringify({chairBusy: true}));
            setTimeout(() => {
                ws.send(JSON.stringify({chairBusy: false}));
            }, 10000);
        }
    });

    /*
        Handle connection closings
     */
    ws.on('close', function (data) {
        console.log('closed connection', data, '\n');
    });
});