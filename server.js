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
var sktio = require('socket.io')
var io = sktio.listen(http);
io.set('log level', 1); // reduce logging
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
var masters = {};         // in-memory record of master's socket for each ID
// scaffolding to create a temporary instance of a device factory
// "lamp" in this case
// this will ultimately be
// Lamp = require('lamp');
// or rather: deviceFactories = { "lamp": require('lamp'), etc };
// 
// TODO: put in PAR for all the factory making, and SEQ it with all the devices registration.

fs.readFile('devices/lamp.jade', function(err,data) {
  if (err) {
    console.log("Error: html component for 'Lamp' not found:\n"+err);
    data="????"; // this is what will be returned for each instance
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
      '      var socket;'+
      '      $(window).load(function(){ socket = io.connect("http://'+SERVER+':'+PORT+'"); });'+
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
			res.write("Page description not found");
		} else {
      console.log("raw data: "+v+", type:"+typeof(v));
			v = JSON.parse(v);
      console.log("parsed data: "+v);
      v=v.value;
      console.log("page description found: "+typeof(v));
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
  // handle client(s)...
  socket.on('registerClient', function(id){
    dumpRegistrations("registerClient pre");
    if (registrations.hasOwnProperty(id)) {
      console.log("adding registration for "+id);
    } else {
      console.log("creating registration for "+id);
      registrations[id] = [];
    }
    registrations[id].push(socket);
    dumpRegistrations("registerClient post");
    if (!deviceState.hasOwnProperty(id)) {
      deviceState[id] = {'value':'offline'};
    }
    console.log("registerClient: sending current state of "+id+": "+deviceState[id].value);
    socket.emit(id,deviceState[id]); // report current state

    socket.on(id, function(data) { // set up handler for incoming "set"
      if (masters.hasOwnProperty(id)) {
        console.log("sending to master "+id+", value: "+JSON.stringify(data));
        masters[id].emit("set", data);
      } else {
        console.log("No master to send "+id + " to.");
      }
    });
  });

  // handle master...
  socket.on('registerMaster', function(id, data){
    if (masters.hasOwnProperty(id)) {
      if (masters[id] != socket){
        console.log("Warning: master  different registration for "+id); 
      } else {
        console.log("Warning: master reregistration for "+id);
      }
    } else {
      console.log("Registering master for "+id);
    }
    masters[id] = socket;
 
    if (data) {
      console.log("Data received: "+data);
      deviceState[id] = data;
      console.log("Echoing data from "+id+"master, value: "+data);
      tellClients(id,data);
    } else {
      console.log("No data received with registration")
    }

    socket.on("val", function (data) {
      console.log("received from master "+id+": "+data);
      deviceState[id] = data;
      tellClients(id,data);
    });

    socket.on('disconnect', function() {
      if (!masters.hasOwnProperty(id)) {
        console.log("Warning: disconnect of unregistered master ???");
      } else {
        console.log("Disconnect of master "+id);
        delete masters[id];
      deviceState[id] = data = {'value':'offline'};
      tellClients(id,data);

      }
    });
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

function dumpRegistrations (text) {
  console.log(text+":\n");
  for (var key in registrations) {
    if (registrations.hasOwnProperty(key)) {
        console.log("...["+key+"]: '"+( (registrations[key][0]) )+"'" );
    }
  }
}

function tellClients(id,data){
  // emit data to all subscribed clients of id, if any
  if (registrations.hasOwnProperty(id)) {
    var i = 0;
    while (subSkt = registrations[id][i++]) {
      console.log("sending "+data+" to "+ subSkt);
      subSkt.emit(id, data);
    }
  }
}
