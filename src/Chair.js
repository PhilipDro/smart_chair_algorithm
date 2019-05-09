import Astar_api from "./astar_api";
import Config from './Config';

let astarApi = new Astar_api();

const config = new Config();

const gridScale = 100;
const distanceMultiplier = 1;

export default class Chair {
    constructor(ip, chair) {
        this.chairSocket = new WebSocket(`ws://${ip}:1312`);
        this.chair = chair;
        this.chairStatusPending = false;
        this.target = undefined;

        this.chairSocket.onopen = ws => {
            console.log(`✅ 💺 🔗 Chair ${this.chair.id} connected`);
            // Start listening for chair
            // state changes
            this.getChairState();
        }
    }

    /**
     *
     * @returns {{bearing: number | *, x: *, y: *}}
     */
    getPosition() {
        return {
            x: this.chair.x,
            y: this.chair.y,
            bearing: this.chair.bearing
        }
    }

    /**
     *
     * @param position
     */
    setPosition(position) {
        this.chair.x = position.x;
        this.chair.y = position.y;
        this.chair.bearing = position.bearing;
        //astarApi.setObstacle(this.getGridPosition());
    }

    /**
     *
     * @returns {{x: number, y: number}}
     */
    getGridPosition() {
        let {x, y} = this.getPosition();
        x = Math.round((x / gridScale));
        y = Math.round((y / gridScale));
        this.positionInGrid = astarApi.getGraph().grid[x][y];
        return this.positionInGrid;
    }

    /**
     *
     * @param x
     * @param y
     * @returns {*}
     */
    getAngleBetweenPoints({x, y}) {
        let angle = Math.atan2(y, x);   //radians
        let degrees = 180 * angle / Math.PI;  //degrees
        this.wantedAngle = (360 + Math.round(degrees + 90)) % 360;

        return this.wantedAngle;
    }

    /**
     *
     * @param pointA
     * @param pointB
     * @returns {number}
     */
    getDistanceBetweenPoints(pointA, pointB) {
        let a = pointA.x - pointB.x;
        let b = pointA.y - pointB.y; // todo: check if distance is correct

        return Math.sqrt(a * a + b * b);
    }

    /**
     *
     * @returns {*}
     */

    /*calcPath() {
        this.path = astarApi.findPath(this.chair.id, this.getGridPosition(), astarApi.getGraph().grid[this.target.x][this.target.y]);
        //console.log("PATH", this.path);
        /!*if (this.nextNode) {
            astarApi.setObstacle(this.nextNode, this.chair.id);
            console.log(`Obstacle set for ${this.chair.id}: ${this.nextNode}`);
        }*!/
        return this.path;
    }*/

    /**
     *
     * @returns {number}
     */
    getId() {
        return this.chair.id;
    }

    /**
     *
     * @returns {{x: number, y: number}}
     */

    /*getNextNode() {
        this.path = this.calcPath();
        this.nextNode = astarApi.getNextNode(this.path) ? astarApi.getNextNode(this.path) : false;
        return this.nextNode;
    }*/

    stop(value = 0) {
        // Tell chair to stop
        this.chairSocket.send(JSON.stringify({
            motionType: "Stop",
            value: value
        }));
        console.log(`📩 🛑 Telling chair ${this.chair.id} to stop`);
    }

    getChairState() {
        this.chairSocket.onmessage = message => {
            let messageJSON = JSON.parse(message.data);
            this.chairBusy = messageJSON.chairBusy;
            if (!this.chairBusy && this.chairBusy !== undefined) {
                this._nextCommand();
            }
            return this.chairBusy;
        }
    }

    _nextCommand() {
        const rotationTolerance = 10; // Degrees
        const positionTolerance = 15; // 100 = 1 grid node distance

        /*
        Make things ready to start the
        movement process
        */
        console.log(`💺 Chair ${this.chair.id} will go to ${this.target.x}|${this.target.y}`);

        // Set wanted angle (angle to next node)
        this.getAngleBetweenPoints({
            x: (this.node.x * gridScale) - this.getPosition().x,
            y: (this.node.y * gridScale) - this.getPosition().y,
        });

        // Set distance to next grid node
        this.nextNodeDistance = this.getDistanceBetweenPoints(
            this.getPosition(),
            {x: this.node.x * 100, y: this.node.y * 100}
        );
        console.log(`💺 Chair ${this.chair.id} wanted angle: ${this.wantedAngle}° (curr: ${this.chair.bearing}°)`);

        /**
         * Check if the current rotation angle
         * is close enough to the wanted one
         */
        let rotateFor = (this.wantedAngle - this.chair.bearing + 540) % 360 - 180;
        if (Math.abs(rotateFor) > rotationTolerance) {
            // Tell chair to rotate
            this.chairSocket.send(JSON.stringify({
                motionType: "Rotation",
                value: rotateFor
            }));
            this.waitForChairAnswer();
            console.log(`📩 💺 🔄 Telling chair ${this.chair.id} to rotate ${rotateFor}°`);
        }

        /*
        Check if the current position is
        close enough to the next node
        */
        else if (this.nextNodeDistance > positionTolerance) {
            // Tell chair to drive
            this.chairSocket.send(JSON.stringify({
                motionType: "Straight",
                value: this.nextNodeDistance * distanceMultiplier
            }));
            this.waitForChairAnswer();
            console.log(`📩 💺 🚗 Telling chair ${this.chair.id} to move for ${this.nextNodeDistance}`);
        } else {
            console.log(`💺 📍 Chair ${this.chair.id} has arrived at grid node`);
            const resolve = this._resolve;
            delete this._resolve;
            resolve();
        }
        /* else {
            /!*
               Check if the current position is
               close enough to the next node
               *!/
            let targetDistance = this.getDistanceBetweenPoints(
                this.getPosition(),
                {x: this.target.x * 100, y: this.target.y * 100}
            );
            if (targetDistance > positionTolerance) {
                // Tell chair to drive
                this.chairSocket.send(JSON.stringify({
                    motionType: "Straight",
                    value: this.nextNodeDistance * distanceMultiplier
                }));
                this.waitForChairAnswer();
                console.log(`📩 💺 🚗 Telling chair ${this.chair.id} to move for ${this.nextNodeDistance}`);
            } else {
                /!**
                 * Chair has arrived
                 *!/
                console.log(`💺 🥳 Chair ${this.chair.id} has arrived at final position`);
                this.stop(1);
                this.isArrived = true;
            }
        }*/
    }

    /**
     *
     * @param node
     */
    goTo(node) {
        if (this._resolve) {
            return Promise.reject();
        }

        const self = this;

        this.node = node;

        return new Promise(function (resolve, reject) {
            self._resolve = resolve;
            self._nextCommand();
        });
    }

    waitForChairAnswer() {
        this.chairStatusPending = true;
        let self = this;
        setTimeout(function () {
            self.chairStatusPending = false;
        }, 200);
    }
}