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


// Initialise console input
var readline = require('readline');

var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

var socket = require('socket.io-client').connect(SERVER,{port:PORT});
socket.on('connect', function() {
    socket.emit('registerMaster', 'DCU_lamp123');
    socket.on('set', function (data) {
        console.log("processing set " + data);
        console.log("Emitting: "+JSON.stringify({'value': JSON.parse(data).set}));
        socket.emit('val', JSON.stringify({'value': JSON.parse(data).set}));
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
