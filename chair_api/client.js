/*
    This script runs on
    all chairs
 */
const WebSocket = require('ws');
let connection = new WebSocket('ws://localhost:1312');

let myId = 1; // Client ID

connection.onmessage = event => {
    let message = JSON.parse(event.data);
    console.log('RECEIVED DATA:', message);

    // Check if command is for this client
    if (message.id === myId) {
        // Motion command
        if (typeof message.motionType !== 'undefined') {
            if (message.motionType === 'Rotation') {
                // Rotation command
                console.log('Rotate with velocity: ' + message.velocity);
            } else if (message.motionType === 'Straight') {
                // Move Straight command
                console.log('Move straight with velocity: ' + message.velocity);
            } else {
                // Unknown motion command type
                console.warn('Unknown motion type', message.motionType);
            }

            // System command
        } else if (typeof message.system !== 'undefined') {
            if (message.system === 'stop') {
                // Stop command
                console.log('Stopping Chair');
            } else {
                // Unknown system command type
                console.warn('Unknown system command', message.system);
            }
        } else {
            // Unknown command type
            console.warn('Unknown command', message);
        }
    } else {
        // Message meant for anther client
        console.log('Message was meant for another client');
    }
};
