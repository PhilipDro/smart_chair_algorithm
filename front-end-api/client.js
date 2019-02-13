const WebSocket = require('ws');
let connection = new WebSocket('ws://localhost:6969');


connection.onmessage = event => {
    let message;

    console.log('> %s', event.data);
    try {
        message = JSON.parse(event.data);
        console.log('RECEIVED COMMAND:', message);
    } catch (e) {
        console.log('No JSON given');
    }
};

connection.send(JSON.parse({"id":0}));