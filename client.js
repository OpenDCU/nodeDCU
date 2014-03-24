/*
First experiment with web sockets
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Test Client

Licence: GNU GPLv3

Author: Kim Spence-Jones
Date: 2014-03-20

Version  Changes
------------------------------------------------------------------------------
0.01.01  Initial websocket server

 */

// Initialise console input
var readline = require('readline');

var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:1337');
ws.on('open', function() {
//    ws.send('something');
});
ws.on('message', function(data, flags) {
	console.log("Received: "+data);
	interact();
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked
});

function interact() {
	rl.question("Send:", function(answer) {
	console.log("Response:", answer);
	interact();
	//rl.close();
	});
}
