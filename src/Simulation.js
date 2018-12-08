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
    [1, 1, 1, 1, 1]
]);

let destination = graph.grid[2][3];

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

                            this.getPath();

                            let start = that.getGridPosition();
                            let target = that.getNextNode();

                            let i = 0;

                            // determine current vector
                            let vector = [0, 0];

                            let intr = setInterval(function() {

                                start = that.getGridPosition();
                                target = that.getNextNode();

                                // set vectors for x and y axis to determine the direction.
                                // vector values are derived from the difference between the position of the chair
                                // and the position of the next node. Vertically such as horizontally.
                                vector = {
                                    x: that.getNextNode() !== undefined ? (that.getNextNode().x - start.x) : 0,
                                    y: that.getNextNode() !== undefined ? (that.getNextNode().y - start.y) : 0
                                }

                                console.log(vector);

                                let direction;

                                if(vector.x === 1) {
                                    direction = 'right';
                                } else if(vector.x === -1) {
                                    direction = 'top';
                                } else if(vector.y === 1) {
                                    direction = 'bottom';
                                } else if (vector.y === -1){
                                    direction = 'left';
                                } else {
                                    direction = 'none';
                                }

                                switch(direction) {
                                    // drive to the right
                                    case 'right':
                                        console.log('drive to the right');

                                        that.move({motionType: 'Rotation', velocity: 0.3});

                                        if(that.getPosition().bearing > 85 && that.getPosition().bearing < 95) {
                                            that.move({motionType: 'Straight', velocity: 0.3});
                                        }

                                        break;

                                    case 'top':
                                        console.log('drive to the top');

                                        that.move({motionType: 'Rotation', velocity: 0.3});

                                        if(that.getPosition().bearing < 15) {
                                            that.move({motionType: 'Straight', velocity: 0.3});
                                        }

                                        break;

                                    case 'bottom':
                                        console.log('drive to the bottom');

                                        that.move({motionType: 'Rotation', velocity: 0.3});

                                        if(that.getPosition().bearing > 170 && that.getPosition().bearing < 190) {
                                            that.move({motionType: 'Straight', velocity: 0.3});
                                        }

                                        break;

                                    case 'left':
                                        console.log('drive to the bottom');

                                        that.move({motionType: 'Rotation', velocity: 0.3});

                                        if(that.getPosition().bearing > 260 && that.getPosition().bearing < 280) {
                                            that.move({motionType: 'Straight', velocity: 0.3});
                                        }

                                        break;

                                    case 'none':
                                        console.log('Finish');
                                        that.stop();
                                        that.getPath();
                                        break;
                                }

                                if(i++ == 1000) {
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
            setObstacle(node) {
                node.weight = 0;
            },
            removeObstacle(node) {
                node.weight = 1;
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