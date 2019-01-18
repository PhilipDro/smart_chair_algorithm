import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';
import { astar, Graph } from './astar';
import Visualisation from './Visualisation';

const DEFAULT_FRICTION = .1;

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
let destination = [graph.grid[1][5], graph.grid[2][5], graph.grid[4][5], graph.grid[5][5]];

window.graph = graph;
window.destination = destination;

// init Visualisation

let visualisation = new Visualisation(document);
window.visualisation = visualisation;

visualisation.setClasses();

export default class Simulation {

    // constructor(markers = []) {
    //     this.element = document.querySelector('.simulation');
    //     this.chairs = markers.map((marker) => {
    //         return {
    //             velocity: {x: 0, y: 0},
    //             angularVelocity: 0,
    //             id: marker.id,
    //             shape: (() => {
    //                 const { x, y, bearing } = marker.position;
    //                 const box = Bodies.rectangle(x, y, 40, 40);
    //                 box.frictionAir = DEFAULT_FRICTION;
    //                 return box;
    //             })()
    //         }
    //     });
    // }

    constructor({element, chairCount = 1} = {}) {
        this.element = element || document.querySelector('.simulation');
        this.chairs = [...Array(chairCount).keys()].map(index => ({
            velocity: {x: 0, y: 0},
            angularVelocity: 0,
            id: index,
            shape: (() => {
                const box = Bodies.rectangle(100 + 100 * index, 100, 40, 40);
                // const box = Bodies.rectangle(100, 100, 40, 40);
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
        destination = [graph.grid[3][3], graph.grid[2][3], graph.grid[4][3], graph.grid[5][3]];
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
                                bearing: normalizedAngle + 2
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
}