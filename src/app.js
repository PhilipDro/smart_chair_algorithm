import Simulation from './Simulation';
import Visualisation from './Visualisation';
import './app.scss';

window.Simulation = Simulation;

// // start the simulation
//
// let sim = new Simulation({chairCount: 2});
// window.sim = sim;
//
// sim.getChairControl().start();

// // make astar api available to window
// window.path = sim.path();
//
// // make chairs available
//
// window.chairs = sim.getChairControl().getChairs();

// move all chairs to set position
//
// for (let i = 0; i < chairs.length; i++) {
//     chairs[i].moveToTarget();
// }

let formationOneButton = document.querySelector('.formation-one');
let formationTwoButton = document.querySelector('.formation-two');
let formationThreeButton = document.querySelector('.formation-three');
let formationFourButton = document.querySelector('.formation-four');

formationOneButton.addEventListener('click', function (e) {
    // start the simulation

    let sim = new Simulation({chairCount: 2});
    window.sim = sim;

    sim.getChairControl().start();

    // make astar api available to window
    window.path = sim.path();

    // make chairs available

    window.chairs = sim.getChairControl().getChairs();

    sim.formationOne();


    for (let i = 0; i < chairs.length; i++) {
        chairs[i].moveToTarget();
    }
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