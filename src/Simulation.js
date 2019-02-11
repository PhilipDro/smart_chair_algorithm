import {Engine, Render, World, Bodies, Body, Events} from 'matter-js';
import { astar, Graph } from './astar';
import Visualisation from './Visualisation';
import Astar_api from './astar_api';

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

let destination;

window.graph = graph;

let visualisation = new Visualisation(document);
let path = new Astar_api();

window.visualisation = visualisation;

visualisation.setClasses();

export default class Simulation {

    constructor(markers = []) {
        this.element = document.querySelector('.simulation');
        this.chairs = markers.map((marker) => {
            return {
                velocity: {x: 0, y: 0},
                angularVelocity: 0,
                id: marker.id,
                shape: (() => {
                    const { x, y, bearing } = marker.position;
                    const box = Bodies.circle(x, y, 40, 40);
                    box.frictionAir = DEFAULT_FRICTION;
                    return box;
                })()
            }
        });
    }

    /**
     * Set starting positions and destination for each formation.
     *
     * TODO: refactor code DRY
     */
    formationOne() {
        Body.setPosition(this.chairs[0].shape, {x: 400, y: 100});
        Body.setPosition(this.chairs[1].shape, {x: 100, y: 100});
        Body.setPosition(this.chairs[2].shape, {x: 100, y: 400});
        Body.setPosition(this.chairs[3].shape, {x: 400, y: 400});
        destination = [graph.grid[3][3], graph.grid[2][3], graph.grid[4][3], graph.grid[4][3]];
        return destination;
    }

    formationTwo() {
        Body.setPosition(this.chairs[0].shape, {x: 200, y: 200});
        Body.setPosition(this.chairs[1].shape, {x: 400, y: 200});
        Body.setPosition(this.chairs[2].shape, {x: 200, y: 400});
        Body.setPosition(this.chairs[3].shape, {x: 400, y: 400});
        destination = [graph.grid[1][4], graph.grid[2][2], graph.grid[4][4], graph.grid[4][2]];
        return destination;
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
                                bearing: normalizedAngle
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
                            this.path = path
                                .path()
                                .findPath(graph, chairs[index].getGridPosition(), destination[index]);
                        },
                        getNextNode() {
                            this.setNextNode();
                            return this.nextNode;
                        },
                        setNextNode() {
                            this.nextNode = path.path().getNextNode(this.path);
                        },
                        getLastNode() {
                            this.setLastNode();
                            return this.lastNode;
                        },
                        setLastNode() {
                            this.lastNode = this.path[this.path.length - 1];
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
                        height: 500,
                        showIds: true
                    }
                });

                /**
                 * Create outer walls.
                 */
                let topWall = Bodies.rectangle(render.options.width / 2, 1, render.options.width, 1, {isStatic: true});
                let rightWall = Bodies.rectangle(render.options.width - 1, render.options.height / 2, 1, render.options.height, {isStatic: true});
                let bottomWall = Bodies.rectangle(render.options.width / 2, render.options.height - 1, render.options.width, 1, {isStatic: true});
                let leftWall = Bodies.rectangle(1, render.options.height / 2, 1, render.options.height, {isStatic: true});

                Engine.run(engine);
                Render.run(render);

                World.add(engine.world, [topWall, rightWall, bottomWall, leftWall]);
                World.add(engine.world, simulation.chairs.map(({shape}) => shape));

                // World.add(engine.world, simulation.chairs.map(({shape}) => shape));

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
}