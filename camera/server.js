const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 3000});

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let positionData = [
    {
        id: 0,
        x: 100,
        y: 100,
        bearing: 0
    }, /*{
        id: 1,
        x: 144,
        y: 377,
        bearing: 64
    }*/
];


console.log('Server listens on localhost:3000');


wss.on('connection', function connection(ws) {
    console.log('connection opened');
    askForInput();
    /*
    Handle incoming messages
     */
    ws.on('message', function incoming(message) {
        console.log(">", message);
    });

    /*
    Handle sending messages
    */
    setInterval(() => {
        ws.send(JSON.stringify(positionData));
    }, 1000);

    /*
        Handle connection closings
     */
    ws.on('close', function (data) {
        console.log('closed connection', data, '\n');
    });
});

function askForInput() {
    readline.question(`send command chair 0 bearing: `, (command) => {
        positionData[0].bearing = parseInt(command);

        setTimeout(function () {
            askForInput();
        }, 100);
    });
};
