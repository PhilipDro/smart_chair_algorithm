import Simulation from './Simulation';
import Route from './route';
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
let feServer = new WebSocket('ws://localhost:9898');
let sim;

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
};

feServer.onopen = ws => {
    console.log(ws);
    feServer.send('hello');

    feServer.onmessage = event => {
        console.log(event);
        if (event.data === 'f1') {
            let destination = sim.formationOne();
            for (let i = 0; i < chairs.length; i++) {
                route.goTo(chairs[i], destination);
            }
        }
    };
};


/**
 * Set event listeners for formation functions.
 * @type {Element}
 */
let formationOneButton = document.querySelector('.formation-one');
let formationTwoButton = document.querySelector('.formation-two');

/**
 * Formation functions for debugging.
 */
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
});
