//import Simulation from './Simulation_for_chairs';
import Chair from './Chair';
import {astar, Graph} from './astar';
import Config from './Config';
import './app.scss';

const config = new Config();
console.log("config", config);

const chairs = [];
const ips = config.chairIps;

/**
 * Connect to front end server.
 * Receive chair targets and send arrived status
 * @type {WebSocket}
 */
let feServer = new WebSocket("ws://" + config.frontEnd.host);
feServer.onopen = ws => {
    console.log("Front-end server connected");
    feServer.onmessage = frontEndEvent => {
        const cameraServer = new WebSocket("ws://" + config.camera.host);
        cameraServer.onmessage = cameraEvent => {
            let markers = JSON.parse(cameraEvent.data);
            //console.log('> marker:', markers);
            for (let marker of [markers]) {
                /*
                    Add recognized chairs to array.
                    If already  stored, update positions.
                 */
                let found = false;
                for (let i = 0; i < chairs.length; i++) {
                    if (chairs[i].getId() === marker.id) {
                        chairs[i].setPosition({x: marker.x, y: marker.y, bearing: marker.bearing});
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    let chairIpIndex = getItemIndex(marker.id, ips);
                    chairs.push(new Chair(ips[chairIpIndex].ip, marker));
                }
            }

            let message = JSON.parse(frontEndEvent.data);
            if (message.receiver === "controller") {
                let targets = message.content; //todo: sync markers and targets array
                for (let i = 0; i < targets.length; i++) {
                    let chairIndex = getChairIndex(targets[i].id, chairs);
                    if (chairIndex !== false) {
                       /* if (checkCollision()) { //todo loop in loop in loop
                            if (chairs[chairIndex].getId() !== checkCollision().chair.id)
                                chairs[chairIndex].goTo(targets[i].target);
                        } else {*/
                            chairs[chairIndex].goTo(targets[i].target);
                        /*}*/
                    }
                }
            }
        }
    }
};


/**
 * Requests current marker positions
 * from camera websocket
 * @type {WebSocket}
 */
const cameraServer = new WebSocket("ws://" + config.camera.host);
cameraServer.onmessage = event => {
    let markers = JSON.parse(event.data);
    //console.log('> marker:', markers);
    for (let marker of [markers]) {
        /*
            Add recognized chairs to array.
            If already stored, update positions.
         */
        let found = false;
        for (let i = 0; i < chairs.length; i++) {
            if (chairs[i].getId() === marker.id) {
                chairs[i].setPosition({x: marker.x, y: marker.y, bearing: marker.bearing});
                found = true;
                break;
            }
        }
        if (!found) {
            let chairIpIndex = getItemIndex(marker.id, ips);
            console.log(ips);
            if (chairIpIndex !== false)
                chairs.push(new Chair(ips[chairIpIndex].ip, marker));
        }
    }
};


/**
 * Helper Functions
 * */

/**
 *
 * @returns {Chair}
 */
function checkCollision() {
    for (let chairA of chairs) {
        for (let chairB of chairs) {
            if (chairA.getId() !== chairB.getId()) {
                console.log("comp chair " + chairA.getId() + " and chair " + chairB.getId() + " dist", chairA.getDistanceBetweenPoints(chairA.getPosition(), chairB.getPosition()));
                if (90 > chairA.getDistanceBetweenPoints(chairA.getPosition(), chairB.getPosition())) {
                    console.log("chairs are too close", chairA, chairB);
                    return chairA;
                } else {
                    return false;
                }
            }
        }
    }
}

/**
 * @param id
 * @param array
 * @returns {boolean|number}
 */
function getChairIndex(id, array) {
    let found = false;
    for (let i = 0; i < array.length; i++) {
        if (parseInt(array[i].chair.id) === id) {
            found = true;
            return i;
        }
    }
    if (!found)
        return false;
}


/**
 * @param id
 * @param array
 * @returns {boolean|number}
 */
function getItemIndex(id, array) {
    let found = false;
    for (let i = 0; i < array.length; i++) {
        if (parseInt(array[i].id) === parseInt(id)) {
            found = true;
            return i;
        }
    }
    if (!found)
        return false;
}