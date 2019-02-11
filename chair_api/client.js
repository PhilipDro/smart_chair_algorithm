const WebSocket = require('ws');
let connections = [new WebSocket('ws://localhost:1312')];

class ChairController {
    constructor() {
    }

    move(id, command) {
        connections[id].send(JSON.stringify(command));
    }

    stop(id) {
        connections[id].send(JSON.stringify({system: 'stop'}), function (data) {
            console.log(data);
        });
    }
}

let chairController = new ChairController();

connections[0].onmessage = event => {
    let message = event.data;
    console.log('RECEIVED DATA:', message);

    chairController.move(0, {id: 0, motionType: 'Rotation', velocity: 0.5});
    // // Check if command is for this client
    // if (message.id === myId) {
    //     // Motion command
    //     if (typeof message.motionType !== 'undefined') {
    //         if (message.motionType === 'Rotation') {
    //             // Rotation command
    //             console.log('Rotate with velocity: ' + message.velocity);
    //         } else if (message.motionType === 'Straight') {
    //             // Move Straight command
    //             console.log('Move straight with velocity: ' + message.velocity);
    //         } else {
    //             // Unknown motion command type
    //             console.warn('Unknown motion type', message.motionType);
    //         }
    //
    //         // System command
    //     } else if (typeof message.system !== 'undefined') {
    //         if (message.system === 'stop') {
    //             // Stop command
    //             console.log('Stopping Chair');
    //         } else if(message.system === 'connected') {
    //             // Connected
    //             console.log('Client Connected');
    //         } else {
    //             // Unknown system command type
    //             console.warn('Unknown system command', message.system);
    //         }
    //     } else {
    //         // Unknown command type
    //         console.warn('Unknown command', message);
    //     }
    // } else {
    //     // Message meant for anther client
    //     console.log('Message was meant for another client');
    // }
};


