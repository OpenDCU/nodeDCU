/*

First experiment with web sockets
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Licence: GNU GPLv3

Author: Kim Spence-Jones
Date: 2014-03-20

Version  Changes
------------------------------------------------------------------------------
0.01.01  Initial websocket server

 */

// ****** config options ******

var SERVER = "localhost";
var PORT   = 3008;

var ELEMENT_SIZE = "70px;";

// ****** namespaces etc. ******

var express = require('express');
var app = express();

var redis = require('redis').createClient();

var http = require('http').createServer(app);
var io = require('socket.io');

io.listen(http);

/* redis "DCU:devices" hash table
  key:    DeviceID
  value:  { 'contact':  <date/time of last value update>
          , 'data':     '{JSON stringified}'
          } 
*/

var lamp = function (id) {
  this.content = '<img src="lamp.svg" />'+'<br />'+id;
};

devices = { "lamp123": new lamp("lamp123")
          , "lamp124": new lamp("lamp124")
          };

// ****** build web pages ******
 
// top and tail
var header = function(req, res, next) {
    res.writeHeader(200, {'content-type': "text/html"});
    res.write(
      '<html>'+
      '<head>'+
      '  <title>Test page</title>'+
      '  <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>'+
      '  <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css" />'+
      '  <script src="http://' + SERVER + ':' + PORT + '/socket.io/socket.io.js"></script>'+
      '  <style>'+
      '    .device {'+
      '      min-width: '+ ELEMENT_SIZE +
      '      width: '+ ELEMENT_SIZE +
      '      min-height: '+ ELEMENT_SIZE +
      '      height: '+ ELEMENT_SIZE +
      '      border: 2px solid red;'+
      '    }'+
      '  </style>'+
      '</head>'+
      '<body>'+
      '<h1>Test page</h1>'
    );
	next();
};

var footer = function(req, res, next) {
	// written so it can be called with two OR three parameters
	res.write(
    '</body>'+
    '</html>');
	if (typeof(next) == 'function') next();
};

var pageMeat = function (req, res, next) {
	// the page number is req.params.id
	// so, get the config...
    redis.hget('DCU:pages',req.params.id, function (err,v){
		// ... and handle what it tells us
		if (err) {
			res.write("Error: "+err.message);
		} else if (v===null) {
			res.write("Page not found");
		} else {
			v = JSON.parse(v).value;
      // v is now the array of instances
      for (var i=0; i<v.length; i++){
        res.write('<div class="device" id="'+v[i]+'"">' + devices[v[i]].content + '</div>');
      }
		}
		next();
    });
};



app.get('/page/:id', header, pageMeat, footer, function(req, res) {
  res.end();
});

http.listen(PORT);




// ********** socket.io *********
/*io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
*/
/* var state = 0;

// initialise console reading
var readline = require('readline');

var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

*
// initialise web socket server
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 1337}),
    wsg = new Array();

wss.on('connection', (function(ws) {
	wsg.push(ws);
    ws.on('message', function(message) {
        console.log('received: %s', message);
    });
    ws.send('VAL{"state":'+state+'}');
})
);

function updateListeners() {
	for (var i = 0; i < wsg.length; i++) {
    wsg[i].send('VAL{"state":'+state+'}');
}
}

function handleInput(answer) {
	console.log("Sending:", answer);
	state=answer;
	updateListeners();
	rl.question("Send:", handleInput);
}

rl.question("Send:", handleInput);
*/