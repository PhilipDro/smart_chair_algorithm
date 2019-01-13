import Simulation from './Simulation';
import Visualisation from './Visualisation';
import './app.scss';

window.Simulation = Simulation;

// start the simulation

let sim = new Simulation({chairCount: 1});
window.sim = sim;

sim.getChairControl().start();

// make astar api available to window
window.path = sim.path();

// make chairs available
window.chairs = sim.getChairControl().getChairs();

// move all chairs to set position
for (var i = 0; i < chairs.length; i++) {
    chairs[i].moveToTarget();
}

// set up WebSocket
let ws = new WebSocket('ws://localhost:3000');
let response;

ws.onmessage = event => {
    response = JSON.parse(event.data);

    sim.marker().setPositions(response);
};

var formationOneButton = document.querySelector('.formation-one');
var formationTwoButton = document.querySelector('.formation-two');
var formationThreeButton = document.querySelector('.formation-three');
var formationFourButton = document.querySelector('.formation-four');

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