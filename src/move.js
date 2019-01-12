moveToTarget(dest) {
    const that = this;

    /**
     * Calculate path using A* algorithm initially.
     */
    that.getPath(that.getId());

    let start = that.getGridPosition();
    let target = dest || that.getNextNode();

    let i = 0;

    /**
     * Determine current vector.
     *
     * @type {{x: number, y: number}}
     */
    let vector = {x: 0, y: 0};

    let moveTo = setInterval(function() {

        /**
         * Set obstacles at nodes that are current locations of the chairs.
         * So that all chairs will calculate their path without colliding with that nodes.
         */
        for(let i = 0; i < chairs.length; i++) {
            let position = that.getGridPosition(chairs[i].getGridPosition());
            simulation.path().setObstacle(position);
        }

        that.getPath(that.getId());

        for(let i = 0; i < chairs.length; i++) {
            visualisation.toggleActiveAll(chairs[i].path, i);
        }

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
            direction = 'left';
        }
        else if(vector.y === 1) {
            direction = 'bottom';
        }
        else if (vector.y === -1){
            direction = 'top';
        }
        else {
            direction = 'none';
        }

        console.log('Chair ' + that.getId() + ' moves to ' + direction + '.');

        switch(direction) {
            /**
             * Drive to the right.
             */
            case 'right':
                that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                if(that.getPosition().bearing > 170 && that.getPosition().bearing < 190) {
                    that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                }

                break;

            /**
             * Drive to the top.
             */
            case 'top':
                that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                if(that.getPosition().bearing > 80 && that.getPosition().bearing < 100) {
                    that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                }

                break;

            /**
             * Drive to the bottom.
             */
            case 'bottom':
                that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                if(that.getPosition().bearing > 260 && that.getPosition().bearing < 280) {
                    that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                }

                break;

            /**
             * Drive to the left.
             */
            case 'left':
                that.move({motionType: 'Rotation', velocity: ROTATION_SPEED});

                if(that.getPosition().bearing > 340) {
                    that.move({motionType: 'Straight', velocity: DRIVE_SPEED});
                }

                break;

            case 'none':
                that.stop();

                /**
                 * Move chairs to exact nodes.
                 */
                that.adjustToNodes();

                break;
        }

        if (i++ > 599) {
            clearInterval(moveTo);
        }

    }, ITERATION_TIME);

    /**
     * Separate interval to actualize obstacles with longer timeout
     * to ensure calculation in time.
     *
     * @type {number}
     */
    let actualizeObstacles = setInterval(function() {

        if (that.getId() === 0) {
            simulation.path().removeAllObstacles();
            visualisation.removeActiveAll();
        }

        if(i++ == 100) {
            clearInterval(actualizeObstacles);
        }
    }, ITERATION_TIME * 3);
}