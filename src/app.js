import Simulation from './Simulation';
import Visualisation from './Visualisation';
import './app.scss';

let destination = [graph.grid[1][5], graph.grid[2][5], graph.grid[4][5], graph.grid[5][5]];

const DRIVE_SPEED = 1;
const ROTATION_SPEED = 0.3;
const ITERATION_TIME = 10;

function goTo(that, destination) {
    // const that = this;

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
    let endAngle = 180 + that.getAngle({
        x: (that.getNextNode().x * 100) - start.x,
        y: (that.getNextNode().y * 100) - start.y
    });

    let dir = Math.abs(endAngle - that.getPosition().bearing) > 180 ? -1 : 1;

    /**
     * Set obstacles at nodes that are current locations of the chairs.
     * So that all chairs will calculate their path without colliding with that nodes.
     */
    for(let i = 0; i < chairs.length; i++) {
        let position = that.getGridPosition(chairs[i].getGridPosition());
        path.setObstacle(position);
    }

    let moveTo = setInterval(function() {
        that.getPath(that.getId());
        /**
         * Toggle path visualisation
         * TODO: try to move outside of interval
         */
        for(let i = 0; i < chairs.length; i++) {
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
            x: that.getNextNode() !== undefined ? Math.abs((that.getNextNode().x * 100) - start.x) : 0,
            y: that.getNextNode() !== undefined ? Math.abs((that.getNextNode().y * 100) - start.y) : 0
        };

        let lastNode = that.path[that.path.length - 1];

        /**
         *  Calculate distance to next destination.
         *  a² + b² = c²
         *
         * @type {number}
         */
        let distance = Math.sqrt(
            Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

        if(that.getId() === 1) {
            console.log(distance);
        }

        /**
         * Set obstacles at nodes that are current locations of the chairs.
         * So that all chairs will calculate their path without colliding with that nodes.
         */
        for(let i = 0; i < chairs.length; i++) {
            let position = that.getGridPosition(chairs[i].getGridPosition());
            path.setObstacle(position);
        }

        if (Math.abs(endAngle - that.getPosition().bearing) > 7.5) {
            that.move({motionType: 'Rotation', velocity: 0.5 * dir});
            console.log('Bearing: ' + that.getPosition().bearing);
            console.log('rotate fast');
        }
        else if (Math.abs(endAngle - that.getPosition().bearing) > 3.5) {
            that.move({motionType: 'Rotation', velocity: 0.02 * dir});
            console.log('rotate slow');
        }
        else if (distance > 50) {
            that.move({motionType: 'Straight', velocity: 1.0});
            console.log('drive fast');
        }
        else if (distance > 15) {
            that.move({motionType: 'Straight', velocity: 0.2});
            console.log('drive slow');
        }
        else {
            console.log('Finished');
            // clearInterval(moveTo);
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
            for(let i = 0; i < chairs.length; i++) {
                let position = that.getGridPosition(chairs[i].getGridPosition());
                path.setObstacle(position);
            }

            that.getPath(that.getId());
            target = that.getNextNode();

            /**
             * Toggle path visualisation
             */
            for(let i = 0; i < chairs.length; i++) {
                visualisation.toggleActiveAll(chairs[i].path, i);
            }

            /**
             * Calculate endAngle.
             */
            endAngle = 180 + that.getAngle({
                x: that.getNextNode() !== undefined ? ((that.getNextNode().x * 100) - start.x) : 0,
                y: that.getNextNode() !== undefined ? ((that.getNextNode().y * 100) - start.y) : 0
            });

            dir = Math.abs(endAngle - that.getPosition().bearing) > 180 ? -1 : 1;
        }
    }, ITERATION_TIME);

    /**
     * Separate interval to actualize obstacles with longer timeout
     * to ensure calculation in time.
     *
     * @type {number}
     */
    let actualizeObstacles = setInterval(function() {

        if (that.getId() === 0) {
            path.removeAllObstacles();
            visualisation.removeActiveAll();
        }

        if(i++ == 1000000) {
            clearInterval(actualizeObstacles);
        }
    }, ITERATION_TIME * 3);
}

window.Simulation = Simulation;

// start the simulation
const sim = new Simulation({chairCount: 4});
const control = sim.getChairControl();
const path = sim.path();
window.sim = sim;

sim.getChairControl().start();

// make astar api available to window
window.path = sim.path();

// make chairs available
window.chairs = sim.getChairControl().getChairs();

// move all chairs to set position
for (var i = 0; i < chairs.length; i++) {
    goTo(chairs[i], destination);
}

let formationOneButton = document.querySelector('.formation-one');
let formationTwoButton = document.querySelector('.formation-two');
let formationThreeButton = document.querySelector('.formation-three');
let formationFourButton = document.querySelector('.formation-four');

formationOneButton.addEventListener('click', function (e) {
    sim.formationOne();
});

formationTwoButton.addEventListener('click', function (e) {
    sim.formationTwo();
});

formationThreeButton.addEventListener('click', function (e) {
    sim.formationThree();
});

formationFourButton.addEventListener('click', function (e) {
    sim.formationFour();
});

// set up WebSocket
// let ws = new WebSocket('ws://localhost:3000');
// let response;

// ws.onmessage = event => {
//
//     const markers = JSON.parse(event.data);
//
//
// };