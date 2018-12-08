import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';
import { astar, Graph } from './astar';

const DEFAULT_FRICTION = .1;

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

let graph = new Graph([
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
]);

let destination = graph.grid[2][2];

window.graph = graph;
window.destination = destination;

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
                            this.setPosition();
                            return this.position;
                        },
                        setPosition() {
                            const angle = toDegrees(chair.shape.angle) % 360;
                            this.position = {
                                x: Math.round(chair.shape.position.x),
                                y: Math.round(chair.shape.position.y),
                                bearing: angle < 0 ? angle + 270 : angle  - 90
                            }
                        },
                        getGridPosition() {
                            this.setGridPosition();
                            return this.positionInGrid;
                        },
                        setGridPosition() {
                            let { x, y } = this.getPosition();
                            x = Math.round((x / 100));
                            y = Math.round((y / 100));
                            this.positionInGrid = graph.grid[x][y];
                        },
                        getPath() {
                            this.setPath();
                            return this.path;
                        },
                        setPath() {
                            this.path = simulation
                                .path()
                                .findPath(graph, this.getGridPosition(), destination);
                        },
                        getNextNode() {
                            this.setNextNode();
                            return this.nextNode;
                        },
                        setNextNode() {
                            this.nextNode = simulation.path().getNextNode(this.path);
                        },
                        moveToTarget(dest) {
                            const that = this;

                            let start = this.getPosition();
                            let end = simulation.path().convertNodeToPx(this.getNextNode());

                            let i = 0;

                            let intr = setInterval(function() {

                                start = that.getPosition();
                                console.log('end: ', end);

                                let switchCase;

                                if(start.x > end.x) {
                                    switchCase = 'A';
                                } else if(start.x < end.x) {
                                    switchCase = 'B';
                                } else if(start.y > end.y) {
                                    switchCase = 'C';
                                } else if (start.y < end.y){
                                    switchCase = 'D';
                                } else {
                                    switchCase = 'E';
                                }

                                switch(switchCase) {
                                    case 'A':
                                        console.log('Case A start.x > end.x');
                                        console.log('start.x: ', start.x, ' end.x: ', end.x);

                                        if(Math.abs(start.x - end.x) <= 5) {
                                            that.move({motionType: 'Straight', velocity: 0.01});
                                        } else {
                                            that.move({motionType: 'Straight', velocity: 0.8});
                                        }
                                        break;

                                    case 'B':
                                        console.log('Case B start.x < end.x');
                                        console.log('start.x: ', start.x, ' end.x: ', end.x);
                                        if(Math.abs(start.x - end.x) <= 5) {
                                            that.move({motionType: 'Straight', velocity: -0.01});
                                        } else {
                                            that.move({motionType: 'Straight', velocity: -0.8});
                                        }
                                        break;

                                    case 'C':
                                        that.move({motionType: 'Rotation', velocity: 0.03});
                                        console.log('Case C');
                                        break;

                                    case 'D':
                                        that.move({motionType: 'Rotation', velocity: -0.03});
                                        console.log('Case D');
                                        break;

                                    case 'E':
                                        console.log('Finish');
                                        that.stop();
                                        break;
                                }

                                if(i++ == 100) {
                                    clearInterval(intr);
                                    console.log('stop interval');
                                    that.stop();
                                }
                            }, 200);
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
            },
            convertNodeToPx(node) {
                let { x, y } = node;
                return {
                    x: (x * 100),
                    y: (y * 100)
                }
            }
        }
    }

}