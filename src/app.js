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
         * TODO: try to move outside of interval
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
            x: that.getNextNode() !== undefined ? Math.abs((that.getNextNode().x * 100) - start.x) : 0,
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

        if (Math.abs(endAngle - that.getPosition().bearing) > 10) {
            that.move({motionType: 'Rotation', velocity: 0.5 * dir});
            console.log('id' + that.getId() + ' rotate fast');
        }
        else if (Math.abs(endAngle - that.getPosition().bearing) > 2) {
            that.move({motionType: 'Rotation', velocity: 0.05 * dir});
            console.log('id' + that.getId() + ' rotate slow');
        }
        else if (distance > 25) {
            that.move({motionType: 'Straight', velocity: 1});
            console.log('id' + that.getId() + ' drive fast');
        }
        // else if (distance > 15) {
        //     that.move({motionType: 'Straight', velocity: 0.2});
        //     console.log('drive slow');
        // }
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
            endAngle = 180 + that.getAngle({
                x: that.getNextNode() !== undefined ? ((that.getNextNode().x * 100) - start.x) : 0,
                y: that.getNextNode() !== undefined ? ((that.getNextNode().y * 100) - start.y) : 0
            });

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

// start the simulation
const sim = new Simulation({chairCount: 6});
const control = sim.getChairControl();
const path = sim.path();
window.sim = sim;

sim.getChairControl().start();

// make astar api available to window
window.path = sim.path();

// make chairs available
window.chairs = sim.getChairControl().getChairs();


let formationOneButton = document.querySelector('.formation-one');
let formationTwoButton = document.querySelector('.formation-two');
let formationThreeButton = document.querySelector('.formation-three');
let formationFourButton = document.querySelector('.formation-four');

formationOneButton.addEventListener('click', function (e) {
    sim.formationOne();
    // move all chairs to set position
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

function getAngle({x, y}) {
    let angle = Math.atan2(y, x);   //radians
    let degrees = 180 * angle / Math.PI;  //degrees
    let calculatedAngle = (Math.round(degrees));

    return calculatedAngle;
}