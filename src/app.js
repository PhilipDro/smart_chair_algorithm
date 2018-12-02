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
                let alpha = 90 + chair1.getPosition().b - 180;
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
    },
    getPosition: () => {
        let position = {
            x: boxA.position.x,
            y: boxA.position.y,
            b: (boxA.angle - 45) % 360,
        }
        return position;

    }
}

const ChairControl = {
    getChairs: () => {
        return [chair1];
    }
}

// window.ChairAPI = ChairAPI;
window.ChairControl = ChairControl;
