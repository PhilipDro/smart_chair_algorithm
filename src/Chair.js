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

const cameraServer = new WebSocket('ws://10.51.5.64:5678'); // todo: put in config

export default class Chair {
    constructor(ip, chair, port = 1312) {
        this.chair = chair;
        this.chairSocket = new WebSocket('ws://' + ip + ':' + port);
    }

    goTo(target) {
        /*
        Make things ready to start the
        movement process
        */
        // Set chair target
        this.target = target;
        console.log(this.chair.id + ' will go to ' + this.target.x + '|' + this.target.y);

        // Set chair path
        this.getPath();
        console.log(this.chair.id + ' has the path ' + this.path);

        // Get angle to next step
        this.getAngleBetweenPoints({
            x: this.getNextNode() !== undefined ? ((this.getNextNode().x * 100) - start.x) : 0,
            y: this.getNextNode() !== undefined ? ((this.getNextNode().y * 100) - start.y) : 0
        });
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
     * @returns {*}
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
}