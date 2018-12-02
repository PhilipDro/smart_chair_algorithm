import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';

// create an engine
const engine = Engine.create();

engine.world.gravity.y = 0;

// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        showAngleIndicator: true
    }
});

// create two boxes and a ground
const boxA = Bodies.rectangle(600, 400, 80, 80);
boxA.frictionAir = 0.1;

// const boxB = Bodies.rectangle(450, 50, 80, 80);
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [boxA, ground]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

let boxAngularVelocity = 0;
let boxVelocity = 0;

Events.on(engine, "afterUpdate", ()=>{
    if(boxAngularVelocity > 0){
        Body.setAngularVelocity( boxA, boxAngularVelocity);
    }
})



const ChairAPI = {
    rotate : velocity => {boxAngularVelocity = velocity * Math.PI/6},
    forward: velocity => Body.setVelocity( boxA, {x: 0, y: velocity * 10}),
    stop: () => boxAngularVelocity = 0
}

const chair1 = {
    move: ({motionType, velocity}) => {
        switch(motionType) {
            case 'Rotation':
                boxAngularVelocity = velocity * Math.PI/6
                return;
            case 'Straight':
                let alpha = 90 + (chair1.getPosition().b - 45) - 180;
                let a = velocity * Math.sin(alpha);
                let b = velocity * Math.cos(alpha);
                console.log(alpha);
                console.log(chair1.getPosition().b);
                Body.setVelocity( boxA, {x: b, y: a})
                return a + ' ' + b;
        }
        // c * sin alpha = a
        // c * cos alpha = b
    },
    stop: () => {
        boxAngularVelocity = 0;
        return true;
    },
    getPosition: () => {
        let position = {
            x: boxA.position.x,
            y: boxA.position.y,
            b: (boxA.angle * 60)  % 360,
            // b: (boxA.angle - 45) % 360,
        }
        return position;

    }
}

const ChairControl = {
    getChairs: () => {
        return [chair1];
    },
    getMousePosition: () => {
        let mousePosition = {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY)
        }
        return mousePosition;
    },
    moveToTarget: () => {
        let start = chair.getPosition();
        let end = ChairControl.getMousePosition();
        console.log(start);
        console.log('end: ');
        console.log(end);

        let i = 0;

        // var runActive = true;

        let intr = setInterval(function() {

            start = chair.getPosition();
            // end = ChairControl.getMousePosition();

            // console.log(chair.getPosition().b);
            // chair.move({motionType: 'Rotation', velocity: .02});

            // when object is on the right of the clicked stop
            if(start.x > end.x) {
                // console.log('start.x > end.x');
                console.log('now!!!!!!!!!!!!!');
                console.log(start.x + ' !!!!!! ' + end.x);

                chair.move({motionType: 'Straight', velocity: .8});



            }
            else if(start.y > end.y) {
                console.log('KLJDÖLFSAJDLAJD');
                chair.move({motionType: 'Rotation', velocity: .03});
                console.log(chair.getPosition().b);


                // stop at 90 degrees
                if(chair.getPosition().b > 85 && chair.getPosition().b <= 95) {


                    chair.stop();


                    // if(runActive == true) {
                    //     chair.stop();
                    //     runActive = false;
                    // }


                    chair.move({motionType: 'Straight', velocity: .8});

                }
            }
            else {
                console.log('FIIIIIIINIIIIIIIIISHHHHH!!!');
                chair.stop();
            }
            // else if(start.x < end.x) {
            //     console.log('start.x < end.x');
            //
            //     chair.move({motionType: 'Rotation', velocity: .03});
            //
            //     console.log('POSITION: ' + chair.getPosition().b );
            //
            //     if(chair.getPosition().b > 80 && chair.getPosition().b <= 100) {
            //         chair.stop();
            //
            //
            //     }
            //     // chair.move({motionType: 'Straight', velocity: 5});
            // }

            // if(start.y > end.y) {
            //     console.log('start.y > end.y');
            //
            //     chair.move({motionType: 'Straight', velocity: 5});
            //     // chair.stop();
            //     // chair.move({motionType: 'Straight', velocity: 5});
            // }
            // else {
            //
            // }

            if(i++ == 100) clearInterval(intr);
        }, 200);

        // while(start.x > end.x) {
        // for(var i = 0; i < 100; i++) {
        //     console.log(i);
        //     if(start.x > end.x) {
        //         console.log('start.x > end.x');
        //
        //         chair.move({motionType: 'Straight', velocity: 5});
        //
        //     }
        //     else {
        //         console.log('start.x <= end.x');
        //     }
        // }

    }
}

// function moveToTarget() {
//
// }


// window.ChairAPI = ChairAPI;
window.ChairControl = ChairControl;
// add event listener for mouse position
document.addEventListener("click", window.ChairControl.moveToTarget);

// create sample instance of chair
const [chair] = ChairControl.getChairs();