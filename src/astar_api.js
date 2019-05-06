import {astar} from "./astar";
import {Graph} from "./astar";

let graph = new Graph([
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
]);

export default class Astar_api {
    findPath(graph, start, end) {
        console.log("graph", graph);
        console.log("start", start);
        console.log("end", end);
        let path = astar.search(graph, start, end);
        console.log("astar search", path);
        if (path === [])
            console.error("astar search returned empty array (maybe target node is occupied?)");
        return path;
    }

    getNextNode(path) {
        return path[0];
    }

    getLastNode(path) {
        return;
    }

    setObstacle(node) {
        graph.grid[node.x][node.y].weight = 0;
    }

    removeObstacle(node) {
        graph.grid[node.x][node.y].weight = 1;
    }

    removeAllObstacles() {
        // console.log('removed all');
        graph.grid.forEach(function (element) {
            element.forEach(function (elem) {
                elem.weight = 1;
            });
        });
    }

    convertNodeToPx(node) {
        let {x, y} = node;
        return {
            x: (x * 100),
            y: (y * 100)
        }
    }

    convertPathToPx(path) {
        return path.map(node => this.convertNodeToPx(node));
    }

    getGraph() {
        return graph;
    }
}

