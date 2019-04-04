export default class Config {
    constructor() {
        return {
            environment: 'prod',
            frontEnd: {
                host: 'localhost:9898'
            },
            camera: {
                host: 'localhost:3000'
            },
            chairs: [
                "localhost",
                "10.51.5.57"
            ]
        };
    }
}
