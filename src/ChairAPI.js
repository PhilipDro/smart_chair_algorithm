/**
 * Open enum to define different types of motions
 */
enum MotionType {
    Straight,
        Straight
}

/**
 * Description of a motion command
 */
interface Motion {
    type: MotionType,

        /**
         * -1.0 <= velocity <= 1.0 : defines speed and direction of a motion;
         *
         * Rotation: positive velocity means clockwise rotation, negative velocity meand counter-clockwise rotation
         * Straight: negative velocity means driving backward, positive means forward
         */
        velocity: number
}

/**
 * Position in centimeters (cm) around the center of a coordinate system.
 */
interface Position {
    /**
     * Position West / East.
     */
        x: number,

        /**
         * Position North / South.
         */
        y: number,

        /**
         * In degree, 0° <= bearing < 360°.
         * North is 0°.
         */
        bearing: number
}

/**
 * Status of chair robot
 */
interface Status {
    /**
     * 0<= battery <= 1.0 - status of engine battery
     */
    battery: number
}

/**
 * Description of a failure in operation, such as an obstacle on the way or a hardware problem.
 */
interface Failure {
    code: number,
        reason: string,
        timestamp: number
}

type FailureListener = (failure: Failure) => void;

interface Chair {
    /**
     * Is ready to receive commands
     */
    ready: boolean,

        /**
         * Perform a motion. Subsequent calls override each other.
         * @param motion A motion command
         * @param timeout When expired without new command or call to stop, the chair stops automatically. In milliseconds.
         */
        move(motion : Motion, timeout?: number) : void,

        /**
         * Immediately stops the current motion.
         */
        stop() : void,

        /**
         * Returns the current status of the chair robot.
         */
        getStatus(): Status,

        /**
         * Returns the current position of the chair when determinable, null else.
         */
        getPosition() : Position | null | undefined,

        /**
         * Returns the currently active motion command or null when motion was stopped manually or by timeout.
         */
        getCurrentMotion() : Motion | null | undefined,

        /**
         * Callback function, invoked when the chair robots a failure.
         */
        onFail: FailureListener,
}

/**
 * Main control interface for the chair system.
 */
interface ChairControl {
    /**
     * Returns a list of all available chairs.
     */
    getChairs() : Array<Chair>,

        /**
         * Start chair control system: startup lifecycle hook for any action to be performed on hardware
         */
        start():void,

        /**
         * Shuts down chair control system.
         */
        shutdown():void,

        /**
         * Tells of the control system and attached hardware is ready.
         */
        ready: boolean,

        /**
         * Called when control system switches into ready-state after an invocation of start
         * @param control
         */
        onReady: (control: ChairControl)=> void
}