import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';
import { astar, Graph } from './astar';

const DEFAULT_FRICTION = .1;

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

let graph = new Graph([
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
]);

let destination = graph.grid[2][1];

window.graph = graph;

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
        }));
    }

    getChairControl() {

        const simulation = this;

        return {
            getChairs: () => {
                return simulation.chairs.map(function(chair){
                    return {
                        position: [],
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
                        getGridPosition() {
                            let { x, y } = this.getPosition();
                            x = Math.round((x / 100));
                            y = Math.round((y / 100));
                            this.position = graph.grid[x][y];
                            return graph.grid[x][y];
                        },
                        setPath() {
                            this.path = simulation
                                .path()
                                .findPath(graph, this.getGridPosition(), destination)
                        },
                        setNextNode() {
                            this.nextNode = simulation.path().getNextNode(this.path);
                        }
                    }
                });
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

    path() {
        const simulation = this;

        return {
            findPath(graph, start, end) {
                return astar.search(graph, start, end);
            },
            getNextNode(path) {
                return path[0];
            }
        }
    }

}