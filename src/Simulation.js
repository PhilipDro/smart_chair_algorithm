import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';
import { astar, Graph } from './astar';

// import MatterWorld from './MatterWorld';

const DEFAULT_FRICTION = .1;

let graph = new Graph([
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
]);

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

export default class Simulation {

    constructor({element, chairCount = 1} = {}) {
        this.element = element || document.querySelector('.simulation');
        this.chairs = [...Array(chairCount).keys()].map(index => ({
            velocity: {x: 0, y: 0},
            angularVelocity: 0,
            shape: (() => {
                const box = Bodies.rectangle(120 + 120 * index, 170 + 170 * index, 50, 50);
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
                    stop() {
                        chair.angularVelocity = 0;
                        chair.velocity = {x: 0, y: 0};
                    },
                    getPosition() {
                        const angle = toDegrees(chair.shape.angle) % 360;
                        return {
                            x: chair.shape.position.x,
                            y: chair.shape.position.y,
                            bearing: angle < 0 ? angle + 270 : angle  - 90
                        }
                    },
                    getGridPosition(position) {
                        let { x, y } = position;
                        x = Math.round((x / 100));
                        y = Math.round((y / 100));
                        graph.nodes[y][x]
                        // return [y, x];
                        return graph.nodes;
                    }
                }))
            },
            start: () => {
                const engine = Engine.create();
                engine.world.gravity.y = 0;
                const render = Render.create({
                    element: this.element,
                    engine: engine,
                    options: {
                        showAngleIndicator: true,
                        width: 500,
                        height: 500
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
                });
            }
        }
    }

}