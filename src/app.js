import Simulation from './Simulation';
import Visualisation from './Visualisation';
import './app.css';

window.Simulation = Simulation;

// start the simulation

let sim = new Simulation({chairCount: 4});
window.sim = sim;

sim.getChairControl().start();

// make astar api available to window
// path.findPath(graph, chairs[0].getGridPosition(), graph.grid[1][1]);
window.path = sim.path();

// make chairs available

window.chairs = sim.getChairControl().getChairs();

// move all chairs to set position

for (var i = 0; i < chairs.length; i++) {
    chairs[i].moveToTarget();
    // chairs[i].adjustToNodes();
}

// mouse position

// document.addEventListener('click', function (e) {
//     let mousePos = chairs[0].getMousePosition(e);
//     chairs[0].moveToTarget(mousePos);
// });

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