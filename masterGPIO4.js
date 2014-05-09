/*
First experiment with web sockets
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Test Client

Licence: GNU GPLv3

Author: Kim Spence-Jones
Date: 2014-03-20

Version  Changes
------------------------------------------------------------------------------
0.01.01  Initial websocket master
0.01.02  Added gpio drive
 */

//var SERVER = "192.168.0.30";
var os = require('os');
var SERVER = os.networkInterfaces()['eth0'][0]['address'];

var PORT   = 3008;

var CLIENT_NAME = 'DCU_lamp124';
if (process.argv[2]) {
	CLIENT_NAME = process.argv[2];
}
console.log('Starting master for '+CLIENT_NAME);

var gpio = require("pi-gpio");

var myValue = 0;

// Initialise console input
var readline = require('readline');

var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

var socket = require('socket.io-client').connect(SERVER,{port:PORT});
socket.on('connect', function() {
	console.log("Connected to server; registering "+CLIENT_NAME+", value: "+myValue);
    socket.emit('registerMaster', CLIENT_NAME, {"value": myValue});
    socket.on('set', function (data) {
        console.log("processing set " + data);
        if (data.hasOwnProperty('value')) {
            console.log("Setting LED "+((data.value>0.5)?"on":"off"));
            myValue = (data.value>0.5)?1:0;
            gpio.open(7, "output", function(err) {        // Open pin 5 for output
                gpio.write(7, myValue, function() {       // Set pin 5
                    gpio.close(7);                        // Close pin 5
                });
            });
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
