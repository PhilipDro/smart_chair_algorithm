import Chair from './Chair';
import Config from './Config';
import './app.scss';
import Astar_api from "./astar_api";

const astarApi = new Astar_api();

const config = new Config();
console.log("💡 Config", config);

const feServer = new WebSocket("ws://" + config.frontEnd.host);
const cameraServer = new WebSocket("ws://" + config.camera.host);

const chairs = [];
const ips = config.chairIps;
let gotTargets = false;

/**
 * Connect to front end server.
 * Receive chair targets and send arrived status
 * @type {WebSocket}
 */
feServer.onopen = ws => {
    console.log("✅ 📱 🔗 Front-end server connected");
};
feServer.onmessage = frontEndEvent => {
    gotTargets = true;
    cameraServer.onmessage = cameraEvent => {
        let marker = JSON.parse(cameraEvent.data);
        //console.log('> marker:', markers);
        /*
            Add recognized chairs to array.
            If already stored, update positions.
         */
        registerChair(marker);
        /**
         * Update obstacle positions and graph
         */
        astarApi.removeAllObstacles();
        for (let chair of chairs) {
            astarApi.setObstacle(chair.getGridPosition(), chair.chair.id);
            /* if (chair.target !== undefined && chair.getPath() !== undefined)
                 astarApi.setObstacle(chair.getNextNode());*/
        }
        //console.log("🗺️ current graph situation", astarApi.getGraph().grid);

        let message = JSON.parse(frontEndEvent.data);
        if (message.receiver === "controller") {
            let targets = message.content; //todo: sync markers and targets array
            for (let i = 0; i < targets.length; i++) {
                let chairIndex = getChairIndex(targets[i].id, chairs);
                if (chairIndex !== false) {
                    //checkCollision();
                    chairs[chairIndex].goTo(targets[i].target);
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
cameraServer.onopen = ws => {
    console.log("✅ 📸 🔗 Camera server connected");
};
cameraServer.onmessage = event => {
    if (!gotTargets) {
        let marker = JSON.parse(event.data);
        /*
            Add recognized chairs to array.
            If already stored, update positions.
         */
        registerChair(marker);
        /**
         * Update obstacle positions and graph
         */
        astarApi.removeAllObstacles();
        for (let chair of chairs) {
            astarApi.setObstacle(chair.getGridPosition(), chair.chair.id);
            /* if (chair.target !== undefined && chair.getPath() !== undefined)
                 astarApi.setObstacle(chair.getNextNode());*/
        }
        //console.log("🗺️ current graph situation", astarApi.getGraph().grid);
    }
};


/**                **
 * Helper Functions *
 *                  */
/**
 *
 * @returns {Chair}
 */
function checkCollision() {
    for (let i = 0; i < chairs.length; i++) {
        for (let j = 0; j < chairs.length; j++) {
            if (i !== j) {
                console.log("comp chair " + chairs[i].getId() + " and chair " + chairs[j].getId() + " dist", chairs[i].getDistanceBetweenPoints(chairs[i].getPosition(), chairs[j].getPosition()));
                if (90 > chairs[i].getDistanceBetweenPoints(chairs[i].getPosition(), chairs[j].getPosition())) {
                    console.log("chairs are too close", chairs[i], chairs[j]);
                    return chairs[i];
                } else {
                    return false;
                }
            }
        }
    }
}

/**
 * Register or update chair
 * @param marker
 */
function registerChair(marker) {
    let found = false;
    for (let i = 0; i < chairs.length; i++) {
        if (chairs[i].getId() === marker.id) {
            chairs[i].setPosition({x: marker.x, y: marker.y, bearing: marker.bearing});
            found = true;
        }
    }
    if (!found) {
        let chairIpIndex = getItemIndex(marker.id, ips);
        chairs.push(new Chair(ips[chairIpIndex].ip, marker));
        console.log(`✅ 💺 Chair ${marker.id} created`);
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
        if (parseInt(array[i].id) === id) {
            found = true;
            return i;
        }
    }
    if (!found)
        return false;
}