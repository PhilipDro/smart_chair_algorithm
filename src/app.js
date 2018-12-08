import Simulation from './Simulation';
import './app.css';

window.Simulation = Simulation;

// start the simulation

let sim = new Simulation({chairCount: 2});
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
}