const url = new URL(window.location.href);
const env = url.searchParams.get("env");

export default class Config {
    constructor() {
        return {
            environment: env || 'prod',
            frontEnd: {
                host: 'localhost:9898'
            },
            camera: {
                host: 'localhost:3000'
            },
        };
    }
}
