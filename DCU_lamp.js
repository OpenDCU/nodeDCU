/* DCU_lamp.js
 * 
 * Simple client for basic on-off DCU_lamp
 *
 * Creates factory for new lamp instances
 * Each instance has...
 * 
 * Lamp.html() -    function returns page fragment which can be put
 *                  in a div on any web page where it's needed
 *
 *
 * usage:
 *   // first, register the module as a device handler factory:
 *   DCU_lamp = require('DCU_lamp');
 *   DCU_lamp.factory(id, function registerFactory(err,factory) {
 *     deviceModules['DCU_lamp'] = factory;
 *   });
 *   
 *   // now, for each required instance
 *   instanceId = deviceFactories['DCU_lamp']('id');
 *
 *   // when you wish to include the device on a web page...
 *   <code for the page> = instanceId.htmlComponent;
 */


//TODO: Why do I need cb? Why isn't 'callback' passed in?

var fs = require('fs');
var logger=require('./logger');
var jade   = require('jade');   // template compiler

var cb;

exports.factory = function (io, callback) {
  logger.info("Creating factory for DCU_lamp");
  cb = callback;
  fs.readFile('devices/lamp.jade', function processData(err,data) {
    if (err) {
      logger.error("Error: html template for 'Lamp' not found:\n"+err);
      data="Error: html template for 'Lamp' not found"; // this is what will be returned for each instance
    }
    logger.info("building html component for 'Lamp':\n"+jade.compile(data)({'id':"id"}));
  
    var factory = function (id) {
      logger.info("building html component for 'Lamp':"+id);
      this.content = this.lampFn({'id':id});
      logger.info("building message receiver for 'Lamp':"+id);
      io.sockets.on('DCU_'+id, function (data) {
        logger.info("Data received from "+id+":\n"+JSON.stringify(data));
      });
    };
  
    factory.prototype = { lampFn: jade.compile(data) };
  
    cb(err,factory);
  });
};