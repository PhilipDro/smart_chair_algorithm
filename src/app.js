const Chair = require('./Chair');
const { astar, Graph } = require('./astar');
// import './app.scss';

const chairs = [];
const ips = [
    //"10.51.5.64",
    "10.51.5.57"
];

/**
 * Get position data via websocket.
 * Switch between mock server and actual camera.
 * @type {WebSocket}
 */

let cameraServer = new WebSocket('ws://10.51.5.64:5678');
//let cameraServer = new WebSocket('ws://localhost:3000');

cameraServer.onmessage = event => {
    const marker = JSON.parse(event.data);
    console.log('> marker:', marker);

    /*
        Add recognized chairs to array.
        If already stored, update positions.
     */
    let found = false;
    for (let i = 0; i < chairs.length; i++) {
        if (chairs[i].getId() === marker.id) {
            console.log('set position');
            chairs[i].setPosition({x: marker.x, y: marker.y, bearing: marker.bearing});
            found = true;
            break;
        }
    }
    if (!found) {
        chairs.push(new Chair(ips[0], marker));
    }
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
};

/**
 * Connect to front end server.
 * Receive chair targets and send arrived status
 * @type {WebSocket}
 */
let feServer = new WebSocket('ws://localhost:9898');
feServer.onopen = ws => {
    console.log("Front-end server connected");
    feServer.onmessage = event => {

        let message = JSON.parse(event.data);
        if (message.receiver === "controller") {
            console.log(message);

            let targets = message.content; //todo: sync markers and targets array
            for (let i = 0; i < chairs.length; i++) {
                chairs[i].goTo(targets[i]);
            }
        }
    }
};
