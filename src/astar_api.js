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
    findPath(chairId, start, end) {
        /*for (let i = 0; i < graph.grid.length; i++) {
            for (let j = 0; j < graph.grid[i].length; j++) {
                let node = graph.grid[i][j];
                if (node.weight === 1 && node.chairId == chairId) {
                    this.removeObstacle({x: i, y: j});
                    console.log("Removed obstacle at", {x: i, y: j});
                }
            }
        }*/
        let path = astar.search(graph, start, end);
        /*console.log("graph", graph);
          console.log("start", start);
         console.log("end", end);
        console.log("astar search", path);*/
        if (path === [])
            console.error("⚠️ Start search returned empty array (maybe target node is occupied?)");
        return path;
    }

    getNextNode(path) {
        return path[0];
    }

    getLastNode(path) {
        return;
    }

    setObstacle(node, chairId) {
        graph.grid[node.x][node.y].weight = 0;
        graph.grid[node.x][node.y].chairId = chairId;
    }

    removeObstacle(node) {
        graph.grid[node.x][node.y].weight = 1;
    }

    removeAllObstacles() {
        // console.log('removed all');
        graph.grid.forEach(function (element) {
            element.forEach(function (elem) {
                elem.weight = 1;
                //elem.chairId = null;
            });
        });
    }

    removeOwnObstacles(chairId) {
        for (let i = 0; i < graph.grid.length; i++) {
            for (let j = 0; j < graph.grid[i].length; j++) {
                let node = graph.grid[i][j];
                if (node.weight === 1 && node.chairId == chairId) {
                    this.removeObstacle({x: i, y: j});
                    console.log("Removed obstacle at", {x: i, y: j});
                }
            }
        }
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

