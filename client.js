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

var SERVER = "localhost";
var PORT   = 3008;

var CLIENT_NAME = 'DCU_lamp123';
if (process.argv[2]) {
	CLIENT_NAME = process.argv[2];
}
console.log('Starting master for '+CLIENT_NAME);

var myValue = 0;

// Initialise console input
var readline = require('readline');

var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

var socket = require('socket.io-client').connect(SERVER,{port:PORT});
socket.on('connect', function() {
	console.log("Connected to server; registering "+CLIENT_NAME);
    socket.emit('registerMaster', CLIENT_NAME, {"value": myValue});
    socket.on('set', function (data) {
        console.log("processing set " + data);
        if (data.hasOwnProperty('value')) {
            console.log("Light is "+((data.value>0.5)?"on":"off"));
        } else {
            console.log("Bad value");
        }
        socket.emit('val', data);
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked
    });
});

function interact() {
	rl.question("Send:", function(answer) {
	console.log("Response:", answer);
	interact();
	//rl.close();
	});
}
