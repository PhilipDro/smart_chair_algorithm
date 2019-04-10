export default class Config {
    constructor() {
        return {
            environment: 'prod',
            frontEnd: {
                host: 'localhost:9898'
            },
            camera: {
                //host: 'localhost:3000'
                //host: '10.51.5.64:5678'
                host: '10.51.7.228:5678'
            },
            chairs: [
                "10.51.5.57",
                //"localhost"
            ]
        };
    }
}
