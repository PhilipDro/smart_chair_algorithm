export default class Config {
    constructor() {
        return {
            environment: 'prod',
            frontEnd: {
                host: 'localhost:9898'
            },
            camera: {
                //host: 'localhost:3000'
                host: '192.168.8.104:5678'
                //host: '10.51.7.228:5678'
            },
            chairIps: [
                {
                    id: 15,
                    ip: "192.168.8.103",
                },
                {
                    id: 8,
                    ip: "192.168.8.107",
                },
                {
                    id: 9,
                    ip: '192.168.8.108'
                }
            ]
        };
    }
}
