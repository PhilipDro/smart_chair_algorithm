/*
 This Websocket Server communicates with
 the front-end application. It sends the
 current positions of the chairs and
 revives commands for them.
 */
import Simulation from '../src/Simulation';
import Route from '../src/route';
import '../src/app.scss';

const route = new Route;

/*
    Front-end Websocket Server
*/
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 6969});

/*
    Websocket Client for Chair positions
 */
let ws = new WebSocket('ws://localhost:3000');
let response;

ws.onmessage = event => {
    const markers = JSON.parse(event.data);
    console.log(markers);
    // Start the simulation.
    const sim = new Simulation(markers);
    window.sim = sim;
    sim.getChairControl().start();

    // Make chairs available.
    window.chairs = sim.getChairControl().getChairs();

    wss.on('connection', function connection(ws) {
        // When connected, send welcome message to client
        ws.send('hello my dear friend');

        // Reviving a message
        ws.on('message', function incoming(data) {
            let message;

            console.log('received: %s', data);
            try {
                message = JSON.parse(data);
            } catch (e) {
                console.log('No JSON given');
            }

            // Message is a proper command
            if (typeof message !== 'undefined') {
                route.goTo(chairs[0], {x: 200, y: 300});
            }
        });

        ws.on('close', function (data) {
            console.log('closed connection', data);
            /*
                Things to do when connection was lost.
            */
        });
    });
};
