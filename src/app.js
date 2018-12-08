import Simulation from './Simulation';
import './app.css';

window.Simulation = Simulation;

// start the simulation

let sim = new Simulation();
window.sim = sim;

sim.getChairControl().start();

// make astar api available to window
// path.findPath(graph, chairs[0].getGridPosition(), graph.grid[1][1]);
window.path = sim.path();

// make chairs available

window.chairs = sim.getChairControl().getChairs();

// mouse position

document.addEventListener('click', function (e) {
    let mousePos = chairs[0].getMousePosition(e);
    chairs[0].moveToTarget(mousePos);
});