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
var io = require('socket.io').listen(http);

var fs = require("fs");

//io;

// set up jade, sylus & nib

var jade   = require('jade');   // template compiler
var stylus = require('stylus'); // css compiler
var nib    = require('nib');    // utilities for css

function compile(str, path) {
  return stylus(str).set('filename', path).use(nib());
}

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(stylus.middleware({ src: __dirname + '/public'
                          , compile: compile
                          })
);
app.use(express.static(__dirname + '/public'));

//

// ******* Some documentation ******

/* redis "DCU:devices" hash table
  key:    DeviceID
  value:  { 'contact':  <date/time of last value update>
          , 'data':     '{JSON stringified}'
          } 
*/

var deviceFactories ={};  // in-memory mapping between device classes and their instance handler factory
var devices = {};         // in-memory mapping between device id and device's instance object
var registrations = {};   // in-memory record of listeners for each device (id used as property, each property is an array)
var deviceState = {};     // in-memory record of current state of each device (id as property, values are current state)

// scaffolding to create a temporary instance of a device factory
// "lamp" in this case
// this will ultimately be
// Lamp = require('lamp');
// or rather: deviceFactories = { "lamp": require('lamp'), etc };
// 
// TODO: put in PAR for all the factory making, and SEQ it with all the devices registration.

fs.readFile('devices/lamp.jade', function(err,data) {
  if (err) {
    console.log("html component for 'Lamp' not found:\n"+err);
    data="???";
  }
  console.log("building html component for 'Lamp':\n"+jade.compile(data)({'id':"id"}));

  var Lamp = function (id) {
    console.log("building html component for 'Lamp':"+id);
    this.content = this.lampFn({'id':id});
    console.log("building message receiver for 'Lamp':"+id);
    io.sockets.on('DCU_'+id, function (data) {
      console.log("Data received from "+id+":\n"+JSON.stringify(data));

    });
  };
  Lamp.prototype = { lampFn: jade.compile(data) };
  deviceFactories["lamp"] = Lamp;

  devices["lamp123"] = new deviceFactories["lamp"]("lamp123");
  devices["lamp124"] = new deviceFactories["lamp"]("lamp124");

});

// ****** build web pages ******
 
// top and tail
var header = function(req, res, next) {
    res.writeHeader(200, {'content-type': "text/html"});
    res.write(
      '<!doctype html>'+
      '<html>'+
      '<head>'+
      '  <title>Test page</title>'+
      '  <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>'+
      '  <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css" />'+
      '  <script src="http://' + SERVER + ':' + PORT + '/socket.io/socket.io.js"></script>'+
      '  <style>'+
      '    .device {'+
      '      min-width: '+ ELEMENT_SIZE +
      '      max-width: '+ ELEMENT_SIZE +
      '      width: '+ ELEMENT_SIZE +
      '      min-height: '+ ELEMENT_SIZE +
      '      max-height: '+ ELEMENT_SIZE +
      '      height: '+ ELEMENT_SIZE +
      '      border: 2px solid red;'+
      '      overflow: hidden;'+
      '      display: inline-block'+
      '    }'+
      '  </style>'+
      '  <script>'+
      '      var socket = io.connect("http://'+SERVER+':'+PORT+'");'+
      '  </script>'+
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
        res.write('<div class="device" id="DCU_'+v[i]+'">' + devices[v[i]].content + '</div>');
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
io.sockets.on('connection', function (socket) {
  socket.on('registerClient', function(id){
    if (registrations.hasOwnProperty(id)) {
      console.log("adding registration for "+id);
      registrations[id].push(socket);
    } else {
      registrations[id] = [socket];
      deviceState[id] = {'value':'?'};
    }
    socket.emit(id,deviceState[id]); // report current state
  });
  socket.on('disconnect', function(){
    // remove this socket from all listener chains
    for (var id in registrations ) {
      var i = registrations[id].indexOf(socket);
      if (i > -1) {     // we're registered in this one
        registrations[id].splice(i,1); // remove the element
        console.log("removing registration from "+id);
      }
    }
  });
});

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