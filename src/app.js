import Simulation from './Simulation_for_chairs';
import Route from './Route';
import {astar, Graph} from './astar';
import './app.scss';

/**
 * Make route calculation methods available.
 * @type {Route}
 */
const route = new Route;

window.Simulation = Simulation;

let sim = new Simulation();
window.sim = sim;
sim.getChairControl().start();
/**
 * Get position data via websocket from _server.js.
 * @type {WebSocket}
 */
let cameraServer = new WebSocket('ws://10.51.6.5:5678');

// FRONT END
let feServer = new WebSocket('ws://localhost:9898');
feServer.onopen = ws => {
    console.log(ws);

    feServer.onmessage = event => {

        let message = JSON.parse(event.data);
        if (message.receiver === "controller") {
            console.log(message);

            let destinations = sim.setDestination(message.content);

            for (let i = 0; i < chairs.length; i++) {
                route.goTo(chairs[i], destinations);
            }
        }
    };
};

cameraServer.onmessage = event => { //todo einheitlich
    const marker = JSON.parse(event.data);

    console.log('> marker:', marker);
    /**
     * Start the simulation.
     */
    sim.createChair(marker);


    // /**
    //  * make astar api available to window
    //  * @type {{findPath, getNextNode, getLastNode, setObstacle, removeObstacle, removeAllObstacles, convertNodeToPx, convertPathToPx, getMousePosition}}
    //  */
    // window.path = sim.path();

    /**
     * make chairs available.
     */
    window.chairs = sim.getChairControl().getChairs();


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
