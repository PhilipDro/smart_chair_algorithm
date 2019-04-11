//import Simulation from './Simulation_for_chairs';
import Chair from './Chair';
import {astar, Graph} from './astar';
import Config from './Config';
import './app.scss';

const config = new Config();
console.log("config", config);

const chairs = [];
const ips = config.chairs;

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
                    chairs.push(new Chair(ips[marker.id], marker));
                }
            }

            let message = JSON.parse(frontEndEvent.data);
            if (message.receiver === "controller") {
                let targets = message.content; //todo: sync markers and targets array
                for (let i = 0; i < chairs.length; i++) {
                    chairs[i].goTo(targets[i].target);
                }
            }
        };
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
            chairs.push(new Chair(ips[0], marker));
        }
    }
};