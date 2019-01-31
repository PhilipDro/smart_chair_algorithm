#Chair API

## Message structure
A message is always a JSON object that contains the id of the corresponding chair.
### Motion command
There are two types of motion commands:
* Straight
* Rotation

####TypeScript
`{id: number, motionType: string, velocity: float}`

### System command
System commands are all commands that are not motion commands. Right now that is just the stop command.
####TypeScript
`{id: number, system: string}`

## Example
To start the example you have to start the _server.js ``node _server.js`` and then the client.js ``node client.js``.

The server will wait for a client to connect and then send a bunch of example-commands. The client will interpret them.