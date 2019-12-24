const HTTPS_PORT = 8443;

const bodyPix = require('@tensorflow-models/body-pix');
//const tfjs = require('@tensorflow/tfjs-node-gpu');
//const objectDetector = require('@cloud-annotations/object-detection');

const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function(request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

  if(request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('client/index.html'));
  }
  
  else if(request.url === '/webrtc.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/webrtc.js'));
  }
  else if(request.url === '/utils.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/utils.js'));
  }


  ///#################################3

  else if(request.url === '/model_web/model.json') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(fs.readFileSync('client/model_web/model.json'));
  }

  else if(request.url === '/model_web/labels.json') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(fs.readFileSync('client/model_web/labels.json'));
  }


  ///#################################3

  else if(request.url === '/manifest.json') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(fs.readFileSync('client/manifest.json'));
  }

  else if(request.url === '/img/icons/icon-512x512.png') {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(fs.readFileSync('client/img/icons/icon-512x512.png'));
  }

  

  //################################3

  else if(request.url === '/model_web/group1-shard1of6') {
    response.writeHead(200, {'Content-Type': 'application/x-binary'});
    response.end(fs.readFileSync('client/model_web/group1-shard1of6'));
  }


  else if(request.url === '/model_web/group1-shard2of6') {
    response.writeHead(200, {'Content-Type': 'application/x-binary'});
    response.end(fs.readFileSync('client/model_web/group1-shard2of6'));
  }


  else if(request.url === '/model_web/group1-shard3of6') {
    response.writeHead(200, {'Content-Type': 'application/x-binary'});
    response.end(fs.readFileSync('client/model_web/group1-shard3of6'));
  }



  else if(request.url === '/model_web/group1-shard4of6') {
    response.writeHead(200, {'Content-Type': 'application/x-binary'});
    response.end(fs.readFileSync('client/model_web/group1-shard4of6'));
  }



  else if(request.url === '/model_web/group1-shard5of6') {
    response.writeHead(200, {'Content-Type': 'application/x-binary'});
    response.end(fs.readFileSync('client/model_web/group1-shard5of6'));
  }



  else if(request.url === '/model_web/group1-shard6of6') {
    response.writeHead(200, {'Content-Type': 'application/x-binary'});
    response.end(fs.readFileSync('client/model_web/group1-shard6of6'));
  }


};

const httpsServer = https.createServer(serverConfig,handleRequest);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
const wss = new WebSocketServer({server: httpsServer});

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });
});

wss.broadcast = function(data) {
  this.clients.forEach(function(client) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

console.log('Server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome.\n\n\
Some important notes:\n\
  * Note the HTTPS; there is no HTTP -> HTTPS redirect.\n\
  * You\'ll also need to accept the invalid TLS certificate.\n\
  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.\n'
);
