export default class Config {
    constructor() {
        return {
            environment: 'prod',
            frontEnd: {
                host: 'localhost:9898'
            },
            camera: {
                //host: 'localhost:3000'
                host: '10.51.4.206:5678'
                //host: '10.51.7.228:5678'
            },
            chairIps: [
                {
                    id: 15,
                    ip: "10.51.5.57",
                },
                {
                    id: 8,
                    ip: "10.51.4.207",
                },
                {
                    id: 19,
                    ip: '10.51.3.65'
                },
                {
                    id: 9,
                    ip: '10.51.3.65'
                }
            ]
        };
    }
}
