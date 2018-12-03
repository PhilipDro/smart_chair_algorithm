import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';

const DEFAULT_FRICTION = .1;

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

export default class Simulation {

    constructor({element, chairCount = 1} = {}) {
        this.element = element || document.body;
        this.chairs = [...Array(chairCount).keys()].map(index => ({
            velocity: {x: 0, y: 0},
            angularVelocity: 0,
            shape: (() => {
                const box = Bodies.rectangle(100 + 100 * index, 100 + 100 * index, 80, 80);
                box.frictionAir = DEFAULT_FRICTION;
                return box;
            })()
        }))
    }

    getChairControl() {

        const simulation = this;

        return {
            getChairs: () => {
                return simulation.chairs.map(chair => ({
                    move({motionType, velocity}) {
                        this.stop();
                        switch (motionType) {
                            case 'Rotation' :
                                chair.angularVelocity = velocity * Math.PI / 72
                                return;
                            case 'Straight' :
                                const x = velocity * Math.cos(chair.shape.angle - Math.PI);
                                const y = velocity * Math.sin(chair.shape.angle - Math.PI);
                                chair.velocity = {x, y};
                        }
                    },
                    stop(){
                        chair.angularVelocity = 0;
                        chair.velocity = {x: 0, y: 0};
                    },
                    getPosition () {
                        const angle = toDegrees(chair.shape.angle) % 360;
                        return {
                            x: chair.shape.position.x,
                            y: chair.shape.position.y,
                            bearing: angle < 0 ? angle + 270 : angle  - 90
                        }
                    }
                }))
            },
            start: () => {
                // create an engine
                const engine = Engine.create();
                engine.world.gravity.y = 0;

                const render = Render.create({
                    element: this.element,
                    engine: engine,
                    options: {
                        showAngleIndicator: true
                    }
                });

                World.add(engine.world, simulation.chairs.map(({shape}) => shape));

                Engine.run(engine);
                Render.run(render);

                Events.on(engine, "afterUpdate", () => {
                    simulation.chairs.forEach(({shape, velocity, angularVelocity}) => {
                        if (angularVelocity != 0) {
                            Body.setAngularVelocity(shape, angularVelocity);
                        }

                        // without test here we would kill the slippage immediately
                        if (velocity.x != 0 || velocity.y != 0) {
                            Body.setVelocity(shape, velocity);
                        }
                    })
                })
            }
        }
    }

}