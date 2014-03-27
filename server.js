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

var express = require('express');
var app = express();

var redis = require('redis').createClient();

// top and tail
var header = function(req, res, next) {
    res.writeHeader(200, {'content-type': "text/html"});
    res.write(
      '<html>'+
      '<head>'+
      '<title>Test page</title>'+
      '</head>'+
      '<body>'
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
			v = JSON.parse(v);
			res.write('<div>'+v.value+'<br /></div>');
		}
		next();
    });
};



app.get('/page/:id', header, pageMeat, footer, function(req, res) {
  res.end();
});

require('http').createServer(app).listen(3008);




// ********** socket.io *********

/*var state = 0;

// initialise console reading
var readline = require('readline');

var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

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