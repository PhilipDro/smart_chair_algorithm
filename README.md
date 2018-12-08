## iot_simulation

Following things are available to you in the browser:

- `chairs` Array (contains mapped chair objects(Chair API))
- `path` Object (A* API)

### Chair API Methods

- `move({motionType: string, velocity: number})`
> moves/ rotates the chair

- `stop()`
> stops the chair

- `getPosition()`
> sets the current position and returns `this.position`

- `getGridPosition()`
> sets the current grid Position and returns `this.positionInGrid`

- `getPath()`
> sets the current path and returns `this.path`

- `getNextNode()`
> sets the next node and returns `this.nextNode`
