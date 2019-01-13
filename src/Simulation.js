import { Engine, Render, World, Bodies, Body, Events } from 'matter-js';
import { astar, Graph } from './astar';
import Visualisation from './Visualisation';

const DEFAULT_FRICTION = .1;
const DRIVE_SPEED = 1;
const ROTATION_SPEED = 0.3;
const ITERATION_TIME = 50;

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

let graph = new Graph([
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1]
]);

// Formation 1
// let destination = [graph.grid[3][3], graph.grid[2][3], graph.grid[4][3], graph.grid[5][3], graph.grid[1][1], graph.grid[1][2]];
let destination = [graph.grid[1][4], graph.grid[2][2], graph.grid[4][4], graph.grid[5][2]];

window.graph = graph;
window.destination = destination;

// init Visualisation
let visualisation = new Visualisation(document);
window.visualisation = visualisation;

visualisation.setClasses();

export default class Simulation {

    constructor({element, chairCount = 1} = {}) {
        this.element = element || document.querySelector('.simulation');
        this.chairs = [...Array(chairCount).keys()].map(index => ({
            velocity: {x: 0, y: 0},
            angularVelocity: 0,
            id: index,
            shape: (() => {
                const box = Bodies.rectangle(100 + 100 * index, 100, 40, 40);
                box.frictionAir = DEFAULT_FRICTION;
                return box;
            })()
        }));
    }

    /**
     * Set starting positions and destination for each formation.
     *
     * TODO: refactor code DRY
     */
    formationOne() {
        Body.setPosition(this.chairs[0].shape, {x: 100, y: 100});
        Body.setPosition(this.chairs[1].shape, {x: 500, y: 100});
        Body.setPosition(this.chairs[2].shape, {x: 100, y: 500});
        Body.setPosition(this.chairs[3].shape, {x: 500, y: 500});
        destination = [graph.grid[1][3], graph.grid[2][3], graph.grid[4][3], graph.grid[5][3]];
    }

    formationTwo() {
        Body.setPosition(this.chairs[0].shape, {x: 200, y: 200});
        Body.setPosition(this.chairs[1].shape, {x: 400, y: 200});
        Body.setPosition(this.chairs[2].shape, {x: 200, y: 400});
        Body.setPosition(this.chairs[3].shape, {x: 400, y: 400});
        destination = [graph.grid[1][4], graph.grid[2][2], graph.grid[4][4], graph.grid[5][2]];
    }

    formationThree() {
        Body.setPosition(this.chairs[0].shape, {x: 300, y: 100});
        Body.setPosition(this.chairs[1].shape, {x: 400, y: 100});
        Body.setPosition(this.chairs[2].shape, {x: 500, y: 100});
        Body.setPosition(this.chairs[3].shape, {x: 400, y: 200});
        Body.setPosition(this.chairs[4].shape, {x: 500, y: 200});
        Body.setPosition(this.chairs[5].shape, {x: 500, y: 300});
        destination = [graph.grid[3][1], graph.grid[2][2], graph.grid[4][2], graph.grid[2][4], graph.grid[4][4], graph.grid[3][5]];
     }

    formationFour() {
        Body.setPosition(this.chairs[0].shape, {x: 400, y: 100});
        Body.setPosition(this.chairs[1].shape, {x: 300, y: 200});
        Body.setPosition(this.chairs[2].shape, {x: 100, y: 300});
        Body.setPosition(this.chairs[3].shape, {x: 400, y: 300});
        Body.setPosition(this.chairs[4].shape, {x: 200, y: 500});
        Body.setPosition(this.chairs[5].shape, {x: 400, y: 500});
        destination = [graph.grid[2][2], graph.grid[3][2], graph.grid[4][2], graph.grid[2][3], graph.grid[3][3], graph.grid[4][3]];
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
                        getId() {
                            let id = chair.id;
                            return id;
                        },
                        getPosition() {
                            this.setPosition();
                            return this.position;
                        },
                        setPosition() {
                            const angle = toDegrees(chair.shape.angle) % 360;
                            const normalizedAngle = angle < 0 ? angle + 360 : angle;
                            this.position = {
                                x: Math.round(chair.shape.position.x),
                                y: Math.round(chair.shape.position.y),
                                bearing: normalizedAngle + 90
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
                        getAngle({x, y}) {
                            this.setAngle({x, y});
                            return this.calculatedAngle;
                        },
                        setAngle({x, y}) {
                            let angle = Math.atan2(y, x);   //radians
                            let degrees = 180 * angle / Math.PI;  //degrees
                            this.calculatedAngle = (360 + Math.round(degrees)) % 360;
                        },
                        getPath(index) {
                            this.setPath(index);
                            return this.path;
                        },
                        setPath(index) {
                            this.path = simulation
                                .path()
                                .findPath(graph, chairs[index].getGridPosition(), destination[index]);
                        },
                        getNextNode() {
                            this.setNextNode();
                            return this.nextNode;
                        },
                        setNextNode() {
                            this.nextNode = simulation.path().getNextNode(this.path);
                        },
                        getLastNode() {
                            this.setLastNode();
                            return this.lastNode;
                        },
                        setLastNode() {
                            this.lastNode = this.path[this.path.length - 1];
                            console.log(this.lastNode);
                        },
                        getMousePosition(e) {
                            this.setMousePosition(e);
                            return this.mousePosition;
                        },
                        setMousePosition(e) {
                            this.mousePosition = simulation.path().getMousePosition(e);
                        },
                        // adjustToNodes() {
                        //     /**
                        //      * This function is called once for every chair as soon as the moveToTarget() function
                        //      * finished. All chairs will be moved to the exact position of the nodes they belong to.
                        //      *
                        //      * @type {adjustToNodes}
                        //      */
                        //     const that = this;
                        //
                        //     let start = that.getPosition();
                        //     let target = that.getGridPosition();
                        //
                        //     let adjust = setInterval(function() {
                        //         start = that.getPosition();
                        //
                        //         let xDifference = (target.x * 100) - start.x;
                        //         let yDifference = (target.y * 100) - start.y;
                        //
                        //         if (that.interruptAdjustment === true) {
                        //             clearInterval(adjust);
                        //             that.stop();
                        //             this.interruptAdjustment = false;
                        //         }
                        //
                        //         else if (xDifference > 5) {
                        //             /**
                        //              * Right
                        //              */
                        //             that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});
                        //
                        //             if(that.getPosition().bearing > 170 && that.getPosition().bearing < 190) {
                        //                 that.move({motionType: 'Straight', velocity: DRIVE_SPEED / 3});
                        //             }
                        //         }
                        //         else if (xDifference < -5) {
                        //             /**
                        //              * Left
                        //              */
                        //             that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});
                        //
                        //             if(that.getPosition().bearing > 340) {
                        //                 that.move({motionType: 'Straight', velocity: DRIVE_SPEED / 3});
                        //             }
                        //         }
                        //         else if (yDifference > 5) {
                        //             /**
                        //              * Bottom
                        //              */
                        //             that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});
                        //
                        //             if(that.getPosition().bearing > 260 && that.getPosition().bearing < 280) {
                        //                 that.move({motionType: 'Straight', velocity: DRIVE_SPEED / 3});
                        //             }
                        //         }
                        //         else if (yDifference < -5) {
                        //             /**
                        //              * Top
                        //              */
                        //             that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});
                        //
                        //             if(that.getPosition().bearing > 80 && that.getPosition().bearing < 100) {
                        //                 that.move({motionType: 'Straight', velocity: DRIVE_SPEED / 3});
                        //             }
                        //
                        //         }
                        //         else {
                        //             clearInterval(adjust);
                        //             // console.log('Adjustment finished.');
                        //             that.stop();
                        //         }
                        //     }, ITERATION_TIME);
                        // },
                        moveToTarget(dest) {
                            const that = this;

                            /**
                             * Calculate path using A* algorithm initially.
                             */
                            that.getPath(that.getId());

                            // let start = that.getGridPosition();
                            let start = that.getPosition();
                            let target = dest || that.getNextNode();

                            let i = 0;

                            /**
                             * Determine current vector.
                             *
                             * @type {{x: number, y: number}}
                             */
                            let vector = {x: target.x - start.x, y: target.y - start.y};

                            /**
                             * Calculate endAngle.
                             */
                            let endAngle = 270 + that.getAngle({
                                x: (that.getNextNode().x * 100) - start.x,
                                y: (that.getNextNode().y * 100) - start.y
                            });

                            let dir = Math.abs(endAngle - that.getPosition().bearing) > 180 ? -1 : 1;

                            /**
                             * Set obstacles at nodes that are current locations of the chairs.
                             * So that all chairs will calculate their path without colliding with that nodes.
                             */
                            for(let i = 0; i < chairs.length; i++) {
                                let position = that.getGridPosition(chairs[i].getGridPosition());
                                simulation.path().setObstacle(position);
                            }

                            let moveTo = setInterval(function() {

                                // if(stopMoveTo === true) {
                                //     clearInterval(moveTo);
                                //     stopMoveTo = false;
                                // }

                                /**
                                 * Toggle path visualisation
                                 * TODO: try to move outside of interval
                                 */
                                for(let i = 0; i < chairs.length; i++) {
                                    visualisation.toggleActiveAll(chairs[i].path, i);
                                }

                                start = that.getPosition();

                                /**
                                 * Set vectors for x and y axis to determine the direction.
                                 * Vector values are derived from the difference between the position of the chair
                                 * and the position of the next node. Vertically such as horizontally.
                                 *
                                 * @type {{x: number, y: number}}
                                 */
                                vector = {
                                    x: that.getNextNode() !== undefined ? ((that.getNextNode().x * 100) - start.x) : 0,
                                    y: that.getNextNode() !== undefined ? ((that.getNextNode().y * 100) - start.y) : 0
                                };

                                let lastNode = that.path[that.path.length - 1];

                                /**
                                 *  Calculate distance to next destination.
                                 *  a² + b² = c²
                                 *
                                 * @type {number}
                                 */
                                let distance = Math.sqrt(
                                    Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

                                // console.log('position X : ' + that.getPosition().x);
                                // console.log('End Position X : ' + (target.x * 100));
                                // console.log('Distance : ' + distance);
                                // console.log('+++++++++++++++++');
                                // console.log('Angle: ' + that.getPosition().bearing);
                                // console.log('endAngle: ' + endAngle);
                                // console.log('direction: ' + dir);
                                // console.log('-------------------------');

                                if (Math.abs(endAngle - that.getPosition().bearing) > 7.5) {
                                    that.move({motionType: 'Rotation', velocity: 0.5 * dir});
                                    console.log('rotate fast');
                                }
                                else if (Math.abs(endAngle - that.getPosition().bearing) > 2.5) {
                                    that.move({motionType: 'Rotation', velocity: 0.05 * dir});
                                    console.log('rotate slow');
                                }
                                else if (distance > 50) {
                                    that.move({motionType: 'Straight', velocity: 1.0});
                                    console.log('drive fast');
                                }
                                else if (distance > 15) {
                                    that.move({motionType: 'Straight', velocity: 0.5});
                                    console.log('drive slow');
                                }
                                else {
                                    console.log('Finished');
                                    that.stop();

                                    /**
                                     * Remove all obstacles.
                                     */
                                    if (that.getId() === 0) {
                                        simulation.path().removeAllObstacles();
                                        visualisation.removeActiveAll();
                                    }

                                    /**
                                     * Set obstacles at nodes that are current locations of the chairs.
                                     * So that all chairs will calculate their path without colliding with that nodes.
                                     */
                                    for(let i = 0; i < chairs.length; i++) {
                                        let position = that.getGridPosition(chairs[i].getGridPosition());
                                        simulation.path().setObstacle(position);
                                    }

                                    that.getPath(that.getId());
                                    target = that.getNextNode();

                                    /**
                                     * Toggle path visualisation
                                     */
                                    for(let i = 0; i < chairs.length; i++) {
                                        visualisation.toggleActiveAll(chairs[i].path, i);
                                    }

                                    /**
                                     * Calculate endAngle.
                                     */
                                    endAngle = 270 + that.getAngle({
                                        x: that.getNextNode() !== undefined ? ((that.getNextNode().x * 100) - start.x) : 0,
                                        y: that.getNextNode() !== undefined ? ((that.getNextNode().y * 100) - start.y) : 0
                                    });

                                    dir = Math.abs(endAngle - that.getPosition().bearing) > 180 ? -1 : 1;
                                }
                            }, ITERATION_TIME);

                            /**
                             * Separate interval to actualize obstacles with longer timeout
                             * to ensure calculation in time.
                             *
                             * @type {number}
                             */
                            let actualizeObstacles = setInterval(function() {

                                // if (that.getId() === 0) {
                                //     simulation.path().removeAllObstacles();
                                //     visualisation.removeActiveAll();
                                // }

                                if(i++ == 10000) {
                                    clearInterval(actualizeObstacles);
                                }
                            }, ITERATION_TIME * 3);
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
                        width: 600,
                        height: 600
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
            getLastNode(path) {
                return
            },
            setObstacle(node) {
                // console.log('obstacle set');
                node.weight = 0;
                visualisation.addObstacle({x: node.x, y: node.y});
            },
            removeObstacle(node) {
                // console.log('obstacle removed');
                node.weight = 1;
                visualisation.removeObstacle({x: node.x, y: node.y});
            },
            removeAllObstacles() {
                // console.log('removed all');
                graph.grid.forEach(function(element) {
                    element.forEach(function(elem) {
                        elem.weight = 1;
                        visualisation.removeObstacle({x: elem.x, y: elem.y});
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
            convertPathToPx(path) {
                return path.map(node => this.convertNodeToPx(node));
            },
            getMousePosition(event) {
                return {
                    x: Math.round(event.clientX),
                    y: Math.round(event.clientY)
                }
            }
        }
    }

    marker() {
        const that = this;

        return {
            setPosition(marker, chair) {
                const { x, y } = marker.position;
                Body.setPosition(chair.shape, {x: x, y: y});
            },

            setPositions(markers) {
                let chairs = that.chairs;

                markers.forEach((marker, index) => {
                    if(typeof chairs[index] !== 'undefined') {
                        this.setPosition(marker, chairs[index]);
                    }
                });

                destination = [graph.grid[1][3], graph.grid[2][3], graph.grid[4][3], graph.grid[5][3]];
            }
        }
    }
}