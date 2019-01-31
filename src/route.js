export default class Route {
    test() {
        this.goTo(that, destination);
    }
    getAngle({x, y}) {
        let angle = Math.atan2(y, x);   //radians
        let degrees = 180 * angle / Math.PI;  //degrees
        return degrees;
    }
    goTo(that, destination) {
        let iteration_time = 100;

        /**
         * Calculate path using A* algorithm initially.
         */
        that.getPath(that.getId());

        let start = that.getPosition();
        let target = destination || that.getNextNode();

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
        let test = this.getAngle({
            x: that.getNextNode() !== undefined ? ((that.getNextNode().x * 100) - start.x) : 0,
            y: that.getNextNode() !== undefined ? ((that.getNextNode().y * 100) - start.y) : 0
        });
        let endAngle = 180 + test;

        /**
         * Set obstacles at nodes that are current locations of the chairs.
         * So that all chairs will calculate their path without colliding with that nodes.
         */
        for (let i = 0; i < chairs.length; i++) {
            let position = that.getGridPosition(chairs[i].getGridPosition());
            path.setObstacle(position);
        }

        that.getPath(that.getId());

        /**
         * Interval begins.
         * @type {number}
         */
        let moveTo = setInterval(function () {

            /**
             * Toggle path visualisation
             */
            for (let i = 0; i < chairs.length; i++) {
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
                x: that.getNextNode() !== undefined ? Math.abs((that.getNextNode().x * 100) - start.x) : 0, // todo fra gets defined here
                y: that.getNextNode() !== undefined ? Math.abs((that.getNextNode().y * 100) - start.y) : 0
            };

            /**
             *  Calculate distance to next destination.
             *  a² + b² = c²
             *
             * @type {number}
             */
            let distance = Math.sqrt(
                Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

            /**
             * Set obstacles at nodes that are current locations of the chairs.
             * So that all chairs will calculate their path without colliding with that nodes.
             */
            for (let i = 0; i < chairs.length; i++) {
                let position = that.getGridPosition(chairs[i].getGridPosition());
                path.setObstacle(position);
            }

            /**
             * Calculate direction based on shortest rotation distance.
             */
            let dir;
            if (that.getPosition().bearing < endAngle) {
                if (Math.abs(that.getPosition().bearing - endAngle) < 180)
                    dir = 1;
                else dir = -1;
            } else {
                if (Math.abs(that.getPosition().bearing - endAngle) < 180)
                    dir = -1;
                else dir = 1;
            }

            console.log('id' + that.getId() + ' Distance: ' + distance);
            console.log('id' + that.getId() + ' WantedAngle: ' + endAngle);
            console.log('id' + that.getId() + ' Curr angle: ' + that.getPosition().bearing);
            console.log('id' + that.getId() + ' Direction: ' + dir);


            // Rotate if rotation is wrong
            if (Math.abs(endAngle - that.getPosition().bearing) > 10) {
                that.move({motionType: 'Rotation', velocity: 0.5 * dir});
                console.log('id' + that.getId() + ' rotate fast');
            }
            // Rotate slower if rotation is wrong but close
            else if (Math.abs(endAngle - that.getPosition().bearing) > 2) {
                that.move({motionType: 'Rotation', velocity: 0.05 * dir});
                console.log('id' + that.getId() + ' rotate slow');
            }
            // Move fast if target is not current position
            else if (distance > 30) {
                that.move({motionType: 'Straight', velocity: 1});
                console.log('id' + that.getId() + ' drive fast');
            }
            // Move slow if target is not current position but close
            else if (distance < 30 && distance > 5) {
                that.move({motionType: 'Straight', velocity: 0.2});
                console.log('id' + that.getId() + ' drive slow');
            }
            // Is arrived
            else {
                console.log('id' + that.getId() + ' Finished');

                clearInterval(moveTo);
                that.stop();

                /**
                 * Remove all obstacles.
                 */
                if (that.getId() === 0) {
                    path.removeAllObstacles();
                    visualisation.removeActiveAll();
                }

                /**
                 * Set obstacles at nodes that are current locations of the chairs.
                 * So that all chairs will calculate their path without colliding with that nodes.
                 */
                for (let i = 0; i < chairs.length; i++) {
                    let position = that.getGridPosition(chairs[i].getGridPosition());
                    path.setObstacle(position);
                }

                that.getPath(that.getId());
                target = that.getNextNode();

                /**
                 * Toggle path visualisation
                 */
                for (let i = 0; i < chairs.length; i++) {
                    visualisation.toggleActiveAll(chairs[i].path, i);
                }

                // that.test(that, destination);
                that.goTo(that, destination);
            }
        }, iteration_time);

        /**
         * Separate interval to actualize obstacles with longer timeout
         * to ensure calculation in time.
         *
         * @type {number}
         */
        let actualizeObstacles = setInterval(function () {

            if (that.getId() === 0) {
                path.removeAllObstacles();
                visualisation.removeActiveAll();
            }

            if (i++ == 1000000) {
                clearInterval(actualizeObstacles);
            }
        }, iteration_time * 3);
    }
}