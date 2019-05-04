import {astar} from "./astar";
import Visualisation from "./_Visualisation";

let visualisation = new Visualisation();

export default class Astar_api {
    path() {
        const simulation = this;

        return {
            findPath(graph, start, end) {
                console.log("graph", graph);
                console.log("start", start);
                console.log("end", end);
                console.log("astar search", astar.search(graph, start, end));
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
                //visualisation.addObstacle({x: node.x, y: node.y});
            },
            removeObstacle(node) {
                // console.log('obstacle removed');
                node.weight = 1;
                //visualisation.removeObstacle({x: node.x, y: node.y});
            },
            removeAllObstacles(graph) {
                // console.log('removed all');
                graph.grid.forEach(function(element) {
                    element.forEach(function(elem) {
                        elem.weight = 1;
                        //visualisation.removeObstacle({x: elem.x, y: elem.y});
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
            }
        }
    }
}
