//import Simulation from './Simulation_for_chairs';
import Chair from './Chair';
import {astar, Graph} from './astar';
import './app.scss';

/**
 * Make route calculation methods available.
 * @type {Chair}
 */
//const route = new Chair;

//window.Simulation = Simulation;

/**
 * Get position data via websocket from _server.js.
 * @type {WebSocket}
 */
let cameraServer = new WebSocket('ws://10.51.6.5:5678');

//let sim; //todo change to window.sim?

let chairs = [];

cameraServer.onmessage = event => {
    const marker = JSON.parse(event.data);
    console.log('> marker:', marker);

    let found = false;
    for (let i = 0; i < chairs.length; i++) {
        if (chairs[i].getId() === marker.id) {
            chairs[i].setPosition({x: marker.x, y: marker.y, bearing: marker.bearing});
            found = true;
            break;
        }
    }
    if (!found) {
        chairs.push(new Chair(marker));
    }

    console.log('intern chair pos', chairs[0].getPosition());
    /**
     * Start the simulation.
     */
    /*    sim = new Simulation(markers);
        window.sim = sim;

        sim.getChairControl().start();*/

    // /**
    //  * make astar api available to window
    //  * @type {{findPath, getNextNode, getLastNode, setObstacle, removeObstacle, removeAllObstacles, convertNodeToPx, convertPathToPx, getMousePosition}}
    //  */
    // window.path = sim.path();

    /**
     * make chairs available.
     */
    //window.chairs = sim.getChairControl().getChairs();

    /**
     * Send chair positions to front end server
     * @type {Array}
     */
    /*setInterval(function () {
        let response = [];
        for (let chair of chairs) {
            response.push({
                id: chair.getId(),
                position: chair.getPosition(),
                arrived: false
            })
        }
        feServer.send(JSON.stringify(response));
    }, 300);*/
};

// FRONT END
let feServer = new WebSocket('ws://localhost:9898');
feServer.onopen = ws => {
    console.log(ws);

    feServer.onmessage = event => {

        let message = JSON.parse(event.data);
        if (message.receiver === "controller") {
            console.log(message);

            //let destinations = sim.setDestination(message.content);
            let targets = message.content; // todo sync markers and targets array
            for (let i = 0; i < chairs.length; i++) {
                chairs[i].goTo(targets[i]);
            }
        }
    }
};
