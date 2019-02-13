const WebSocket = require('ws');

export default class FrontEndServer {
    constructor() {
        const frontEnd = new WebSocket.Server({port: 9898});
        frontEnd.on('connection', function connection(ws) {
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
            });

            ws.on('close', function (data) {
                console.log('closed connection', data, '\n');
            });
        });
    }
}