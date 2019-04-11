import Astar_api from "./astar_api";
import {Graph} from "./astar";

let path = new Astar_api().path();
import Config from './Config';

const config = new Config();


let graph = new Graph([
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
]);

const cameraServer = new WebSocket("ws://" + config.camera.host);

export default class Chair {
    constructor(ip, chair, port = 1312) {
        this.chair = chair;
        this.chairSocket = new WebSocket('ws://' + ip + ':' + port);

        // Start listening for chair
        // state changes
        this.getChairState();

        cameraServer.onmessage = message => {
            //let pos = JSON.parse(message.data)[0];
            let pos = JSON.parse(message.data);
            this.setPosition(pos);
        }

        this.chairStatusPending = false;

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
    }

    /**
     *
     * @returns {{x: number, y: number}}
     */
    getGridPosition() {
        let {x, y} = this.getPosition();
        x = Math.round((x / 100));
        y = Math.round((y / 100));
        this.positionInGrid = graph.grid[x][y];
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
        let b = pointA.y / 2 - pointB.y / 2; // todo: only when rechteckiges Kamerabild

        return Math.sqrt(a * a + b * b);
    }

    /**
     *
     * @returns {*}
     */
    getPath() {
        this.path = path.findPath(graph, this.getGridPosition(), graph.grid[this.target.x][this.target.y]);
        return this.path;
    }

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
    getNextNode() {
        this.path = this.getPath();
        this.nextNode = path.getNextNode(this.path);
        return this.nextNode;
    }

    stop() {
        // Tell chair to stop
        /*this.chairSocket.send(JSON.stringify({
            motionType: "Stop",
            value: 0
        }));*/
        console.log(`Telling chair ${this.chair.id} to stop`);
    }

    getChairState() {
        this.chairSocket.onmessage = message => {
            let messageJSON = JSON.parse(message.data);
            if (this.chairBusy !== messageJSON.chairBusy)
                this.goTo(this.target || this.getPosition());
            this.chairBusy = messageJSON.chairBusy;
            return this.chairBusy;
        }
    }

    /**
     *
     * @param target
     */
    goTo(target) {
        /*
        Check chair state.
        Only calculate path if chair
        is ready
         */
        if (!this.chairStatusPending && !this.chairBusy) {
            /*
            Make things ready to start the
            movement process
            */
            // Set chair target
            this.target = target;
            console.log(`Chair ${this.chair.id} will go to ${this.target.x}|${this.target.y}`);

            // Set chair path
            this.getPath();
            console.log(`Chair ${this.chair.id} path: ${this.path}`);

            // Set wanted angle (angle to next node)
            this.getAngleBetweenPoints({
                x: this.getNextNode() !== undefined ? ((this.getNextNode().x * 100) - this.chair.x) : null,
                y: this.getNextNode() !== undefined ? ((this.getNextNode().y * 100) - this.chair.y) : null
            });

            // Set distance to next grid node
            this.nextNodeDistance = this.getDistanceBetweenPoints(
                this.getPosition(),
                {x: this.nextNode.x, y: this.nextNode.y}
            );
            console.log(`Chair ${this.chair.id} wanted angle: ${this.wantedAngle}°`);

            const rotationTolerance = 10; // degrees
            const positionTolerance = 10; // pixels


            /*
            Check if the current rotation angle
            is close enough to the wanted one
             */

            let left, right, rotateFor;
            if (this.wantedAngle > this.chair.bearing) {
                left = this.wantedAngle - this.chair.bearing - 360;
                right = this.wantedAngle - this.chair.bearing;
                console.log("wa > bea");
            } else {
                left = this.wantedAngle - this.chair.bearing
                right = 360 - this.chair.bearing - this.wantedAngle;
                console.log("wa < bea");
            }

            console.log(left, right);

            if (Math.abs(left) < Math.abs(right))
                rotateFor = left;
            else
                rotateFor = right;

            if (Math.abs(this.wantedAngle - this.chair.bearing) > rotationTolerance) {
                // Tell chair to rotate
                this.chairSocket.send(JSON.stringify({
                    motionType: "Rotation",
                    value: rotateFor
                }));
                this.waitForChairAnswer();
                console.log(`Telling chair ${this.chair.id} to rotate ${rotateFor}°`);
            }



            /*
            Check if the current position is
            close enough to the next node
             */
            else if (this.nextNodeDistance > positionTolerance) {
                // Tell chair to drive
                this.chairSocket.send(JSON.stringify({
                    motionType: "Straight",
                    value: this.nextNodeDistance
                }));
                this.waitForChairAnswer();
                console.log(`Telling chair ${this.chair.id} to move ${this.nextNodeDistance} pixels`);


            } else {
                console.log(`Chair ${this.chair.id} has arrived`);
            }
        } else {
            console.log("Chair is busy...");
        }
    }

    waitForChairAnswer() {
        this.chairStatusPending = true;
        let self = this;
        setTimeout(function () {
            self.chairStatusPending = false;
        }, 1000);
    }
}