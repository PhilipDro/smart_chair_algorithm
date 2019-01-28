/*
    This script runs on
    all chairs
 */

const WebSocket = require('ws');

let connection = new WebSocket('ws://localhost:1312');
let response;
connection.onmessage = event => {
    let command = JSON.parse(event.data);
    console.log('RECEIVED DATA:', command);

    // Motion command
    if (typeof command.motionType !== 'undefined') {
        if (command.motionType === 'Rotation') {
            console.log('Rotate with velocity: ' + command.velocity);
        } else if (command.motionType === 'Straight') {
            console.log('Move straight with velocity: ' + command.velocity);
        } else {
            console.warn('Unknown motion type', command.motionType);
        }
    }
};
