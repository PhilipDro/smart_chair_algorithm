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
Every chair will run a server. The client is the controller, it will look for the chair servers (todo) and they will connect.

To start the example you have to start the server.js ``node server.js`` and then the client.js ``node client.js``.
