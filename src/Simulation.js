import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';
import { astar, Graph } from './astar';

const DEFAULT_FRICTION = .1;
const DRIVE_SPEED = 1.1;
const ROTATION_SPEED = 0.3;

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

let destination = graph.grid[4][3];

window.graph = graph;
window.destination = destination;

export default class Simulation {

    constructor({element, chairCount = 1} = {}) {
        this.element = element || document.querySelector('.simulation');
        this.chairs = [...Array(chairCount).keys()].map(index => ({
            velocity: {x: 0, y: 0},
            angularVelocity: 0,
            shape: (() => {
                const box = Bodies.rectangle(90 + 90 * index, 90 + 90 * index, 50, 50);
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
                        getMousePosition(e) {
                            this.setMousePosition(e);
                            return this.mousePosition;
                        },
                        setMousePosition(e) {
                            this.mousePosition = simulation.path().getMousePosition(e);
                        },
                        moveToTarget(dest) {
                            const that = this;
                            /**
                             * Calculate path using A* algorithm.
                             */
                            this.getPath();

                            let start = that.getGridPosition();
                            let target = dest || that.getNextNode();

                            let i = 0;

                            /**
                             * Determine current vector.
                             *
                             * @type {number[]}
                             */
                            let vector = [0, 0];

                            let intr = setInterval(function() {

                                start = that.getGridPosition();
                                target = that.getNextNode();

                                /**
                                 * Set vectors for x and y axis to determine the direction.
                                 * Vector values are derived from the difference between the position of the chair
                                 * and the position of the next node. Vertically such as horizontally.
                                 *
                                 * @type {{x: number, y: number}}
                                 */
                                vector = {
                                    x: that.getNextNode() !== undefined ? (that.getNextNode().x - start.x) : 0,
                                    y: that.getNextNode() !== undefined ? (that.getNextNode().y - start.y) : 0
                                };

                                let direction;

                                if(vector.x === 1) {
                                    direction = 'right';
                                }
                                else if(vector.x === -1) {
                                    direction = 'top';
                                }
                                else if(vector.y === 1) {
                                    direction = 'bottom';
                                }
                                else if (vector.y === -1){
                                    direction = 'left';
                                }
                                else {
                                    direction = 'none';
                                }

                                switch(direction) {
                                    /**
                                     * Drive to the right.
                                     */
                                    case 'right':
                                        console.log('drive to the right');

                                        that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                                        if(that.getPosition().bearing > 80 && that.getPosition().bearing < 100) {
                                            that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                                        }

                                        break;

                                    /**
                                     * Drive to the top.
                                     */
                                    case 'top':
                                        console.log('drive to the top');

                                        that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                                        if(that.getPosition().bearing < 15) {
                                            that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                                        }

                                        break;

                                    /**
                                     * Drive to the bottom.
                                     */
                                    case 'bottom':
                                        console.log('drive to the bottom');

                                        that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                                        if(that.getPosition().bearing > 170 && that.getPosition().bearing < 190) {
                                            that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                                        }

                                        break;

                                    /**
                                     * Drive to the left.
                                     */
                                    case 'left':
                                        console.log('drive to the left');

                                        that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                                        if(that.getPosition().bearing > 260 && that.getPosition().bearing < 280) {
                                            that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                                        }

                                        break;

                                    case 'none':
                                        console.log('Finish');
                                        that.stop();

                                        /**
                                         * Set obstacles in every iteration. Obstacles are nodes that are populated by other
                                         * chairs so that collision will be avoided.
                                         *
                                         * TODO right now all node are cleared but the remove function should only
                                         * remove obstacles from the last wave of iterations.
                                         */
                                        simulation.path().removeAllObstacles();
                                        simulation.path().setObstacle(that.getGridPosition());

                                        that.getPath();
                                        break;
                                }

                                /**
                                 * TODO change stopping condition
                                 */
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

                        /**
                         * Without test here we would kill the slippage immediately.
                         */
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
                console.log('obstacle set');
                node.weight = 0;
            },
            removeObstacle(node) {
                node.weight = 1;
            },
            removeAllObstacles() {
                graph.grid.forEach(function(element) {
                    // simulation.path().removeObstacle(element);
                    element.forEach(function(elem) {
                        console.log('removed');
                        elem.weight = 1;
                    });
                });
            },
            convertNodeToPx(node) {
                let { x, y } = node;
                return {
                    x: (x * 100),
                    y: (y * 100)
                }
            },
            getMousePosition(event) {
                return {
                    x: Math.round(event.clientX),
                    y: Math.round(event.clientY)
                }
            }
        }
    }

}