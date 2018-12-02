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

class ChairAPI {
    constructor(body, angularVelocity) {
        this.body = body;
        this.angularVelocity = angularVelocity;
    }
    rotate(velocity) {
        this.angularVelocity = (velocity * (Math.PI/6));
    }
    forward(velocity) {
        Matter.Body.setVelocity(body, { x: 0, y: velocity * 10 });
    }
    stop() {
        this.angularVelocity = 0;
    }
}

class Chair {
    constructor(readyState, batteryState, motionState) {
        this.readyState = readyState;
        this.batteryState = batteryState;
        this.motionState = motionState;
    }

    ready() {
        return this.readyState;
    }

    getStatus() {
        return this.batteryState;
    }

    move({motionType, velocity}) {
        switch(motionType) {
            case 'Rotation':
                boxAngularVelocity = velocity * Math.PI/6
                return;
            case 'Straight':
                let alpha = 90 + (this.getPosition().b - 45) - 180;
                let a = velocity * Math.sin(alpha);
                let b = velocity * Math.cos(alpha);
                console.log(alpha);
                console.log(this.getPosition().b);
                Body.setVelocity( boxA, {x: b, y: a});
                return a + ' ' + b;
        }
    }

    stop() {
        boxAngularVelocity = 0;
    }

    getPosition() {
        return {
            x: boxA.position.x,
            y: boxA.position.y,
            b: (boxA.angle * 57.3 + 270)  % 360,
            // b: (boxA.angle - 45) % 360,
        }
    }
}

class ChairControl {
    constructor(chair) {
        this.chair = chair;
    }

    getChairs() {
        return [this.chair];
    }

    getMousePosition(e) {
        return {
            x: e.clientX,
            y: e.clientY
        }
    }

    moveToTarget(e) {
        let chair = this.chair;

        let start = chair.getPosition();
        let end = this.getMousePosition(e);

        console.log(start);
        console.log('end: ');
        console.log(end);

        let i = 0;

        let intr = setInterval(function() {
            console.log('timeout');

            start = chair.getPosition();

            if(start.x > end.x) {
                console.log('start.x > end.x');

                chair.move({motionType: 'Straight', velocity: 2});

            }

            else if(start.x <= end.x) {
                console.log('start.x <= end.x');

                chair.move({motionType: 'Rotation', velocity: .03});

                console.log('POSITION: ' + chair.getPosition().b );

                if(chair.getPosition().b > 80 && chair.getPosition().b <= 100) {
                    chair.stop();
                }
            }

            if(start.y > end.y) {
                console.log('start.y > end.y');

                chair.move({motionType: 'Straight', velocity: 5});
            }

            else if(i++ == 100) {
                clearInterval(intr);
            }

        }, 200);

    }
};

let myChairAPI = new ChairAPI(boxA, boxAngularVelocity);

let chair = new Chair(
    true,
    {
        battery: 1.0
    },
    "Straight"
);

let chairControl = new ChairControl(chair);

// window.ChairAPI = ChairAPI;
window.chairControl = chairControl;

// add event listener for mouse position
document.addEventListener("click", function(e) {
    window.chairControl.moveToTarget(e)
});

// create sample instance of chair
// const [chair] = ChairControl.getChairs();

window.chair = chair;