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

var state = 0;

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
