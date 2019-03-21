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

export default class Chair {
    constructor(ip, chair) {
        this.chair = chair;
        this.chairSocket = new WebSocket('ws://' + ip + ':1312');
    }

    goTo(destination) {
        let iteration_time = 1000;

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
        console.log(start);
        console.log(this.getNextNode());
        let endAngle = this.getAngleBetweenPoints({
            x: this.getNextNode() !== undefined ? ((this.getNextNode().x * 100) - start.x) : 0,
            y: this.getNextNode() !== undefined ? ((this.getNextNode().y * 100) - start.y) : 0
        });

        /**
         * Set obstacles at nodes that are current locations of the chairs.
         * So that all chairs will calculate their path without colliding with that nodes.
         */
        path.setObstacle(this.getGridPosition());

        this.getPath(this.getId());

        let lockBearing = false;

        let self = this;
        /**
         * Interval begins.
         * @type {number}
         */
        let moveTo = setInterval(function () {
            function stopAndRecalc() {
                lockBearing = false;
                console.log('id' + self.getId() + ' Recalculating Path');
                clearInterval(moveTo);
                self.stop();

                /**
                 * Remove all obstacles.
                 */
                if (self.getId() === 0) {
                    path.removeAllObstacles(graph);
                }

                /**
                 * Set obstacles at nodes that are current locations of the chairs.
                 * So that all chairs will calculate their path without colliding with that nodes.
                 */
                path.setObstacle(self.getGridPosition());

                self.goTo(self, destination);
            }

            start = self.getPosition();

            if (self.getGridPosition() === self.getNextNode()) {

            }

            /**
             * Set vectors for x and y axis to determine the direction.
             * Vector values are derived from the difference between the position of the chair
             * and the position of the next node. Vertically such as horizontally.
             *
             * @type {{x: number, y: number}}
             */
            console.log(self.getNextNode());
            vector = {
                x: self.getNextNode() !== undefined ? Math.abs((self.getNextNode().x * 100) - start.x) : 0,
                y: self.getNextNode() !== undefined ? Math.abs((self.getNextNode().y * 100) - start.y) : 0
            };
            console.log(vector);

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
            path.setObstacle(self.getGridPosition());

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

            console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
            console.log('id' + self.getId() + ' Distance: ' + distance);
            console.log('id' + self.getId() + ' WantedAngle: ' + endAngle);
            console.log('id' + self.getId() + ' Curr angle: ' + self.getPosition().bearing);
            console.log('id' + self.getId() + ' Direction: ' + dir);
            console.log('id' + self.getId() + ' Lock bearing: ' + lockBearing);
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

            /** 
             * Rotate for the calculated angle if bearing is wrong.
             */
			if (!lockBearing && (Math.abs(endAngle - self.getPosition().bearing) > 10)) {
				console.log('EEEEEEEEEEEEEEEND AAAANGLE: ' + endAngle);
                self.move({motionType: 'Rotation', value: endAngle * dir});
				//self.move({motionType: 'Straight', velocity: 1 * dir});
                console.log('id' + self.getId() + ' rotate fast');
				console.log('NEEEEEEW PAAAAAAAAAAAART');
            }
			 
			 
            if (!lockBearing && (Math.abs(endAngle - self.getPosition().bearing) > 50)) {
                self.move({motionType: 'Rotation', velocity: 0.7 * dir});
                console.log('id' + self.getId() + ' rotate fast');
            }
            /**
             * Rotate slower if bearing is wrong but close.
             *
            else if (!lockBearing && (Math.abs(endAngle - self.getPosition().bearing) > 5)) {
                self.move({motionType: 'Rotation', velocity: 0.6 * dir});
                console.log('id' + self.getId() + ' rotate slow');
            }*/
            /**
             * test code
             */
           /* else if (start.x - self.getNextNode().x < 0) {
                if (self.getPosition().x > (self.getNextNode().x * 100) + 20) {
                    console.log("recalculate case 1");  
                    stopAndRecalc();
                }
            } else if (start.x - self.getNextNode().x > 0) {
                if (self.getPosition().x < (self.getNextNode().x * 100) - 20) {
                    console.log("recalculate case 2");
                    stopAndRecalc();
                }
            } else if (start.y - self.getNextNode().y < 0) {
                if (self.getPosition().y > (self.getNextNode().y * 100) + 20) {
                    console.log("recalculate case 3");
                    stopAndRecalc();
                }
            } else if (start.y - self.getNextNode().y > 0) {
                if (self.getPosition().y < (self.getNextNode().y * 100) - 20) {
                    console.log("recalculate case 4");
                    stopAndRecalc();
                }
            }*/
            /**
             * Move fast if target is not current position.
             */
            else if (distance > 30) {
                lockBearing = true;
                self.move({motionType: 'Straight', velocity: 1});
                console.log('id' + self.getId() + ' drive fast');
            }
            /**
             * Move slow if target is not current position but close.
             */
            else if (distance < 30 && distance > 25) {
                lockBearing = true;
                self.move({motionType: 'Straight', velocity: 0.8});
                console.log('id' + self.getId() + ' drive slow');
            }


            /**
             * If chair is far far far away then recalculate.
             */
            /*else if (distance > 150) {
                lockBearing = false;
                console.log('id' + self.getId() + ' Recalculating Path');
                clearInterval(moveTo);
                self.stop();

                /!**
                 * Remove all obstacles.
                 *!/
                if (self.getId() === 0) {
                    path.removeAllObstacles(graph);
                }

                /!**
                 * Set obstacles at nodes that are current locations of the chairs.
                 * So that all chairs will calculate their path without colliding with that nodes.
                 *!/
                path.setObstacle(self.getGridPosition());

                self.goTo(self, destination);
            }*/

            /**
             * Is arrived at GridNode.
             */
            else {
                console.log('id' + self.getId() + ' Finished');

                clearInterval(moveTo);
                //self.stop();

                /**
                 * Remove all obstacles.
                 */
                if (self.getId() === 0) {
                    path.removeAllObstacles(graph);
                }

                /**
                 * Set obstacles at nodes that are current locations of the chairs.
                 * So that all chairs will calculate their path without colliding with that nodes.
                 */
                path.setObstacle(self.getGridPosition());

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
            }
        }, iteration_time * 3);
    }

    /*move({motionType, velocity}) {
        this.stop();
        console.log("sending move command to chair", this.chair);
        this.chairSocket.send(JSON.stringify({motionType, velocity}));
    }*/
	
	move({motionType, value}) {
        //this.stop();
		let command = JSON.stringify({motionType, value});
		console.log(command);
        console.log("sending move command to chair", this.chair);
        this.chairSocket.send(command);
    }

    stop() {
        this.chairSocket.send(JSON.stringify({motionType: "Stop"}));
    }

    /**
     * Returns aruco marcer id.
     */
    getId() {
        return this.chair.id;
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
        this.calculatedAngle = (360 + Math.round(degrees + 90)) % 360;
        return this.calculatedAngle;
    }

    getPath(index) {
        this.path = path.findPath(graph, this.getGridPosition(), graph.grid[3][3]); // todo: hack
        return this.path;
    }

    getNextNode() {
        this.path = path.findPath(graph, this.getGridPosition(), graph.grid[3][3]);
        this.nextNode = path.getNextNode(this.path);
        return this.nextNode;
    }

    getLastNode() {
        this.lastNode = this.path[this.path.length - 1];
    }
}