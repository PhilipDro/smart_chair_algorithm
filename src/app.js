import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';

// create an engine
const engine = Engine.create();

engine.world.gravity.y = 0;

// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine
});

// create two boxes and a ground
const boxA = Bodies.rectangle(400, 200, 80, 80);
boxA.frictionAir = .1;

const boxB = Bodies.rectangle(450, 50, 80, 80);
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

let boxAngularVelocity = 0;
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

window.ChairAPI = ChairAPI;