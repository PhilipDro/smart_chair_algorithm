import Astar_api from "./astar_api";
import {Graph} from "./astar";

let path = new Astar_api().path();

let graph = new Graph([
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
]);


/* !!!!!!!todo remove!!!!!!!! */
const chairSocket = new WebSocket('ws://10.51.5.57:1312');

export default class Chair {
    constructor(chair) {
        this.chair = chair;
    }

    goTo(destination) {
        let iteration_time = 100;

        /**
         * Calculate path using A* algorithm initially.
         */
        let start = this.getPosition();
        let target = destination || this.getNextNode();

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
        let angleBetweenPoints = this.getAngleBetweenPoints({
            x: this.getNextNode() !== undefined ? ((this.getNextNode().x * 100) - start.x) : 0,
            y: this.getNextNode() !== undefined ? ((this.getNextNode().y * 100) - start.y) : 0
        });
        let endAngle = 180 + angleBetweenPoints;

        /** TODO
         * Set obstacles at nodes that are current locations of the chairs.
         * So that all chairs will calculate their path without colliding with that nodes.
         *
         for (let i = 0; i < chairs.length; i++) {
            let position = this.getGridPosition(this.getGridPosition());
            path.setObstacle(position);
        }
         **/

        this.getPath(this.getId());

        let self = this;
        /**
         * Interval begins.
         * @type {number}
         */
        let moveTo = setInterval(function () {

            start = self.getPosition();

            /**
             * Set vectors for x and y axis to determine the direction.
             * Vector values are derived from the difference between the position of the chair
             * and the position of the next node. Vertically such as horizontally.
             *
             * @type {{x: number, y: number}}
             */
            vector = {
                x: self.getNextNode() !== undefined ? Math.abs((self.getNextNode().x * 100) - start.x) : 0, // todo fra gets defined here
                y: self.getNextNode() !== undefined ? Math.abs((self.getNextNode().y * 100) - start.y) : 0
            };

            /**
             *  Calculate distance to next destination.
             *  a² + b² = c²
             *
             * @type {number}
             */
            let distance = Math.sqrt(
                Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

            /** TODO
             * Set obstacles at nodes that are current locations of the chairs.
             * So that all chairs will calculate their path without colliding with that nodes.
             *
             for (let i = 0; i < chairs.length; i++) {
                let position = self.getGridPosition(self.getGridPosition());
                path.setObstacle(position);
            }*/

            /**
             * Calculate direction based on shortest rotation distance.
             */
            let dir;
            if (self.getPosition().bearing < endAngle) {
                if (Math.abs(self.getPosition().bearing - endAngle) < 180)
                    dir = 1;
                else dir = -1;
            } else {
                if (Math.abs(self.getPosition().bearing - endAngle) < 180)
                    dir = -1;
                else dir = 1;
            }

            console.log('id' + self.getId() + ' Distance: ' + distance);
            console.log('id' + self.getId() + ' WantedAngle: ' + endAngle);
            console.log('id' + self.getId() + ' Curr angle: ' + self.getPosition().bearing);
            console.log('id' + self.getId() + ' Direction: ' + dir);


            // Rotate if rotation is wrong
            if (Math.abs(endAngle - self.getPosition().bearing) > 10) {
                self.move({motionType: 'Rotation', velocity: 0.5 * dir});
                console.log('id' + self.getId() + ' rotate fast');
            }
            // Rotate slower if rotation is wrong but close
            else if (Math.abs(endAngle - self.getPosition().bearing) > 2) {
                self.move({motionType: 'Rotation', velocity: 0.05 * dir});
                console.log('id' + self.getId() + ' rotate slow');
            }
            // Move fast if target is not current position
            else if (distance > 30) {
                self.move({motionType: 'Straight', velocity: 1});
                console.log('id' + self.getId() + ' drive fast');
            }
            // Move slow if target is not current position but close
            else if (distance < 30 && distance > 5) {
                self.move({motionType: 'Straight', velocity: 0.2});
                console.log('id' + self.getId() + ' drive slow');
            }
            // Is arrived
            else {
                console.log('id' + self.getId() + ' Finished');

                clearInterval(moveTo);
                self.stop();

                /**
                 * Remove all obstacles.
                 */
                if (self.getId() === 0) {
                    path.removeAllObstacles(graph);
                    visualisation.removeActiveAll();
                }

                /** TODO
                 * Set obstacles at nodes that are current locations of the chairs.
                 * So that all chairs will calculate their path without colliding with that nodes.
                 *
                 for (let i = 0; i < chairs.length; i++) {
                    let position = self.getGridPosition(self.getGridPosition());
                    path.setObstacle(position);
                }*/

                self.getPath(self.getId());
                target = self.getNextNode();

                /**
                 * Toggle path visualisation
                 *
                 for (let i = 0; i < chairs.length; i++) {
                    visualisation.toggleActiveAll(chairs[i].path, i);
                }**/

                self.goTo(self, destination);
            }
        }, iteration_time);

        /**
         * Separate interval to actualize obstacles with longer timeout
         * to ensure calculation in time.
         *
         * @type {number}
         */
        let actualizeObstacles = setInterval(function () {

            if (self.getId() === 0) {
                path.removeAllObstacles(graph);
                visualisation.removeActiveAll();
            }

            if (i++ == 1000000) {
                clearInterval(actualizeObstacles);
            }
        }, iteration_time * 3);
    }

    move({motionType, velocity}) {
        this.stop();
        console.log("sending move command to chair", this.chair);
        chairSocket.send(JSON.stringify({motionType, velocity}));
        /*        switch (motionType) {
                    case 'Rotation' :
                        chair.angularVelocity = velocity * Math.PI / 72
                        return;
                    case 'Straight' :
                        const x = velocity * Math.cos(chair.shape.angle - Math.PI);
                        const y = velocity * Math.sin(chair.shape.angle - Math.PI);
                        chair.velocity = chair.velocity = {x, y}
                }*/
    }

    stop() {
        /*chair.angularVelocity = 0;
        chair.velocity = {x: 0, y: 0};*/
    }

    /**
     * Returns aruco marcer id.
     *
     */
    getId() {
        let id = this.chair.id;
        return id;
    }

    getItemIndex(id, array) {
        let found = false;
        for (let i = 0; i < array.length; i++) {
            if (array[i].id === id) {
                found = true;
                return i;
            }
        }
        if (!found)
            return false;
    }

    getPosition() {
        return {
            x: this.chair.x,
            y: this.chair.y,
            bearing: this.chair.bearing
        }
    }

    setPosition(position) {
        this.chair.x = position.x;
        this.chair.y = position.y;
        this.chair.bearing = position.bearing;
    }

    getGridPosition() {
        let {x, y} = this.getPosition();
        x = Math.round((x / 100));
        y = Math.round((y / 100));
        this.positionInGrid = graph.grid[x][y];
        return this.positionInGrid;
    }

    getAngleBetweenPoints({x, y}) {
        let angle = Math.atan2(y, x);   //radians
        let degrees = 180 * angle / Math.PI;  //degrees
        this.calculatedAngle = (360 + Math.round(degrees)) % 360;
        return this.calculatedAngle;
    }

    getPath(index) {
        this.path = path.findPath(graph, this.getGridPosition(), graph.grid[1][1]);
        return this.path;
    }

    getNextNode() {
        this.path = path.findPath(graph, this.getGridPosition(), graph.grid[1][1]);
        this.nextNode = path.getNextNode(this.path);
    }

    getLastNode() {
        this.lastNode = this.path[this.path.length - 1];
    }
}