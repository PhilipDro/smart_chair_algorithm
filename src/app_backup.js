import Simulation from './Simulation';
import Route from './route';
import './app.scss';

/**
 * Make route calculation methods available.
 * @type {Route}
 */
const route = new Route;

//window.Simulation = Simulation;

/**
 * Get position data via websocket from server.js.
 * @type {WebSocket}
 */
let ws = new WebSocket('ws://localhost:3000');
let response;
ws.onmessage = event => {
    const markers = JSON.parse(event.data);

    /**
     * Start the simulation.
     */
    const sim = new Simulation(markers);
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

    /**
     * Set event listeners for formation functions.
     * @type {Element}
     */
    // let formationOneButton = document.querySelector('.formation-one');
    // let formationTwoButton = document.querySelector('.formation-two');

    /*/!**
     * Formation functions for debugging.
     *!/
    formationOneButton.addEventListener('click', function (e) {
        let destination = sim.formationOne();
        for (let i = 0; i < chairs.length; i++) {
            route.goTo(chairs[i], destination);
        }
    });

    formationTwoButton.addEventListener('click', function (e) {
        let destination = sim.formationTwo();
        for (let i = 0; i < chairs.length; i++) {
            route.goTo(chairs[i], destination);
        }
    });*/
};