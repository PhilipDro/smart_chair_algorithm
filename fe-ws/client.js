const WebSocket = require("ws");

const connection = new WebSocket("ws://localhost:3000");

    connection.on("open", function() {
    connection.on("message", function incoming(data) {
        console.log(JSON.parse(data));
    });

    connection.on("close", function() {
        console.log("connection is closed");
    });

});