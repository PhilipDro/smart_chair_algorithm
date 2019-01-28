## Documentation for the hardware api

Position data of the chairs will be transmitted via a javascript websocket communicating with the hardware.
The Chairs are moving towards their calculated directions and need to be supervised constantly.
Because of the information is always changing a websocket would be an appropriate method to solve the issue.

### Client-side API

The client will use the WebSocket Object that provides the API for creating and managing a WebSocket connection.

```
 let ws = new WebSocket('ws://localhost:3000');
 let response;
 ws.onmessage = event => {
     const markers = JSON.parse(event.data);
 
     // start the simulation
     const sim = new Simulation(markers);
     window.sim = sim;
 };
 ```

After creating a new instance of the WebSocket object, the position data will be requested. 
In this example the Simulation environment is then based on the data.

### Server-side API

The server provides chair position information using the nodeJS WebSocketServer and HTTP.

 ```
 const WebSocketServer = require('websocket').server;
 const http = require('http');
 ```

Data could be stored using an array of objects:

 ```
 let positionData = [
     {
         id: 0,
         position: {
             x: 100,
             y: 100,
             bearing: 0
         }
     },
     {
         id: 1,
         position: {
             x: 100,
             y: 200,
             bearing: 0
         }
     },
     {
         id: 2,
         position: {
             x: 100,
             y: 300,
             bearing: 0
         },
     },
     {
         id: 3,
         position: {
             x: 100,
             y: 400,
             bearing: 0
         }
     }
 ]
 ```
 
 The server is being set up and ready to serve data at port 3000 upon request:
 
 ```
  const server = http.createServer(function(request, response) {});
  
  server.listen(3000, function() {
      console.log('Server listens on localhost:3000');
  });
  
  // create the server
  const wsServer = new WebSocketServer({
      httpServer: server
  });
  
  // WebSocket server
  wsServer.on('request', function(request) {
  
      const connection = request.accept(null, request.origin);
      console.log('connection opened');
  
      // send the data to the client
      connection.send(JSON.stringify(positionData));
  
      connection.on('close', function(connection) {
          console.log('connection closed');
      });
  });
  ```