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

/**
 * Get position data via websocket from _server.js.
 * @type {WebSocket}
 */
let cameraServer = new WebSocket('ws://localhost:3000');

let sim; //todo change to window.sim?

cameraServer.onmessage = event => { //todo einheitlich
    const markers = JSON.parse(event.data);

    console.log('> marker:', markers);
    /**
     * Start the simulation.
     */
    sim = new Simulation(markers);
    window.sim = sim;

    sim.getChairControl().start();

    // /**
    //  * make astar api available to window
    //  * @type {{findPath, getNextNode, getLastNode, setObstacle, removeObstacle, removeAllObstacles, convertNodeToPx, convertPathToPx, getMousePosition}}
    //  */
    // window.path = sim.path();

    /**
     * make chairs available.
     */
    window.chairs = sim.getChairControl().getChairs();


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
};
