const WebSocket = require("ws");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const connection = new WebSocket("ws://localhost:9898");

connection.on("open", function () {
    connection.on("message", function incoming(data) {
        console.log(JSON.parse(data));
    });

    askForInput();

    connection.on("close", function () {
        console.log("connection is closed");
    });
});


const message = {
    receiver: "controller",
    content: [
        {
            id: 0,
            target: {
                x: 4,
                y: 1
            }
        },
        {
            id: 1,
            target: {
                x: 3,
                y: 4
            }
        },
        {
            id: 2,
            target: {
                x: 2,
                y: 1
            }
        },
        {
            id: 3,
            target: {
                x: 4,
                y: 4
            }
        },
    ]
};



function askForInput() {
    readline.question(`Press enter to send`, (command) => {
        console.log(`Sending`);
        connection.send(JSON.stringify(message));
        setTimeout(function () {
            askForInput();
        }, 100);
    });
};