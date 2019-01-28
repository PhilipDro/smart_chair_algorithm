import Simulation from './Simulation';
//import Visualisation from './Visualisation';
import './app.scss';

let destination = [graph.grid[4][5], graph.grid[2][5], graph.grid[4][5], graph.grid[5][5]];

const DRIVE_SPEED = 1;
const ROTATION_SPEED = 0.3;
const ITERATION_TIME = 100;

function goTo(that, destination) {
    /**
     * Calculate path using A* algorithm initially.
     */
    that.getPath(that.getId());

    let start = that.getPosition();
    let target = destination || that.getNextNode();

    let i = 0;

    /**
     * Determine current vector.
     *
     * @type {{x: number, y: number}}
     */
    let vector = {x: target.x - start.x, y: target.y - start.y};

    /**
     * Calculate endAngle.
     */
    let endAngle = 180 + getAngle({
        x: that.getNextNode() !== undefined ? ((that.getNextNode().x * 100) - start.x) : 0,
        y: that.getNextNode() !== undefined ? ((that.getNextNode().y * 100) - start.y) : 0
    });

    /**
     * Set obstacles at nodes that are current locations of the chairs.
     * So that all chairs will calculate their path without colliding with that nodes.
     */
    for (let i = 0; i < chairs.length; i++) {
        let position = that.getGridPosition(chairs[i].getGridPosition());
        path.setObstacle(position);
    }

    that.getPath(that.getId());

    /**
     * Interval begins.
     * @type {number}
     */
    let moveTo = setInterval(function () {

        /**
         * Toggle path visualisation
         */
        for (let i = 0; i < chairs.length; i++) {
            visualisation.toggleActiveAll(chairs[i].path, i);
        }

        start = that.getPosition();

        /**
         * Set vectors for x and y axis to determine the direction.
         * Vector values are derived from the difference between the position of the chair
         * and the position of the next node. Vertically such as horizontally.
         *
         * @type {{x: number, y: number}}
         */
        vector = {
            x: that.getNextNode() !== undefined ? Math.abs((that.getNextNode().x * 100) - start.x) : 0, // todo fra gets defined here
            y: that.getNextNode() !== undefined ? Math.abs((that.getNextNode().y * 100) - start.y) : 0
        };

        /**
         *  Calculate distance to next destination.
         *  a² + b² = c²
         *
         * @type {number}
         */
        let distance = Math.sqrt(
            Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

        /**
         * Set obstacles at nodes that are current locations of the chairs.
         * So that all chairs will calculate their path without colliding with that nodes.
         */
        for (let i = 0; i < chairs.length; i++) {
            let position = that.getGridPosition(chairs[i].getGridPosition());
            path.setObstacle(position);
        }

        /**
         * Calculate direction based on shortest rotation distance.
         */
        let dir;
        if (that.getPosition().bearing < endAngle) {
            if (Math.abs(that.getPosition().bearing - endAngle) < 180)
                dir = 1;
            else dir = -1;
        } else {
            if (Math.abs(that.getPosition().bearing - endAngle) < 180)
                dir = -1;
            else dir = 1;
        }

        console.log('id' + that.getId() + ' Distance: ' + distance);
        console.log('id' + that.getId() + ' WantedAngle: ' + endAngle);
        console.log('id' + that.getId() + ' Curr angle: ' + that.getPosition().bearing);
        console.log('id' + that.getId() + ' Direction: ' + dir);


        // Rotate if rotation is wrong
        if (Math.abs(endAngle - that.getPosition().bearing) > 10) {
            that.move({motionType: 'Rotation', velocity: 0.5 * dir});
            console.log('id' + that.getId() + ' rotate fast');
        }
        // Rotate slower if rotation is wrong but close
        else if (Math.abs(endAngle - that.getPosition().bearing) > 2) {
            that.move({motionType: 'Rotation', velocity: 0.05 * dir});
            console.log('id' + that.getId() + ' rotate slow');
        }
        // Move fast if target is not current position
        else if (distance > 30) {
            that.move({motionType: 'Straight', velocity: 1});
            console.log('id' + that.getId() + ' drive fast');
        }
        // Move slow if target is not current position but close
        else if (distance < 30 && distance > 5) {
            that.move({motionType: 'Straight', velocity: 0.2});
            console.log('id' + that.getId() + ' drive slow');
        }
        // Is arrived
        else {
            console.log('id' + that.getId() + ' Finished');

            clearInterval(moveTo);
            that.stop();

            /**
             * Remove all obstacles.
             */
            if (that.getId() === 0) {
                path.removeAllObstacles();
                visualisation.removeActiveAll();
            }

            /**
             * Set obstacles at nodes that are current locations of the chairs.
             * So that all chairs will calculate their path without colliding with that nodes.
             */
            for (let i = 0; i < chairs.length; i++) {
                let position = that.getGridPosition(chairs[i].getGridPosition());
                path.setObstacle(position);
            }

            that.getPath(that.getId());
            target = that.getNextNode();

            /**
             * Toggle path visualisation
             */
            for (let i = 0; i < chairs.length; i++) {
                visualisation.toggleActiveAll(chairs[i].path, i);
            }

            /**
             * Calculate endAngle.
             */
            console.log('id' + that.getId() + ' position', that.getPosition());
            console.log('id' + that.getId() + ' next node', that.getNextNode());
            let testAngle = 180 + getAngle({
                x: that.getNextNode() !== undefined ? ((that.getNextNode().x * 100) - start.x) : 0,
                y: that.getNextNode() !== undefined ? ((that.getNextNode().y * 100) - start.y) : 0
            });
            console.log('id' + that.getId() + ' angle', testAngle);

            goTo(that, destination);
        }
    }, ITERATION_TIME);

    /**
     * Separate interval to actualize obstacles with longer timeout
     * to ensure calculation in time.
     *
     * @type {number}
     */
    let actualizeObstacles = setInterval(function () {

        if (that.getId() === 0) {
            path.removeAllObstacles();
            visualisation.removeActiveAll();
        }

        if (i++ == 1000000) {
            clearInterval(actualizeObstacles);
        }
    }, ITERATION_TIME * 3);
}

window.Simulation = Simulation;

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

    /**
     * make astar api available to window
     * @type {{findPath, getNextNode, getLastNode, setObstacle, removeObstacle, removeAllObstacles, convertNodeToPx, convertPathToPx, getMousePosition}}
     */
    window.path = sim.path();

    /**
     * make chairs available.
     */
    window.chairs = sim.getChairControl().getChairs();

    /**
     * Set event listeners for formation functions.
     * @type {Element}
     */
    let formationOneButton = document.querySelector('.formation-one');
    let formationTwoButton = document.querySelector('.formation-two');
    let formationThreeButton = document.querySelector('.formation-three');
    let formationFourButton = document.querySelector('.formation-four');

    /**
     * Formation functions for debugging.
     */
    formationOneButton.addEventListener('click', function (e) {
        sim.formationOne();
        for (var i = 0; i < chairs.length; i++) {
            goTo(chairs[i], destination);
        }
    });

    formationTwoButton.addEventListener('click', function (e) {
        sim.formationTwo();
        for (var i = 0; i < chairs.length; i++) {
            goTo(chairs[i], destination);
        }
    });

    formationThreeButton.addEventListener('click', function (e) {
        sim.formationThree();
        for (var i = 0; i < chairs.length; i++) {
            goTo(chairs[i], destination);
        }
    });

    formationFourButton.addEventListener('click', function (e) {
        sim.formationFour();
        for (var i = 0; i < chairs.length; i++) {
            goTo(chairs[i], destination);
        }
    });
};



function getAngle({x, y}) {
    let angle = Math.atan2(y, x);   //radians
    let degrees = 180 * angle / Math.PI;  //degrees
    return Math.round(degrees);
}