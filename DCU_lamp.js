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
//      Also, 'genericify' this so that it can load factory for
//      any kind of device.

var fs     = require('fs');
var logger = require('./logger');
var jade   = require('jade');   // template compiler

/* factory function creates a factory for instances of a particular
 * device interface. Client behaviour is fully described in the xx.jade
 * file which the factory loads and parses.
 * Parameters:
 *     io:          the socket.io instance which is handling our traffic
 *     deviceClass: the generic name of the device type. (needs to be
 *                  supplied by masters and included in page data element
 *                  descriptions)
 *     callback:    the callback function for completion event
 */

exports.factory = function (io, callback) {
  logger.info("Creating factory for DCU_lamp");
  //var cb = callback;
  fs.readFile('devices/lamp.jade', function processData(err,fileData) {
    if (err) {
      logger.error("Error: html template for 'Lamp' not found:\n"+err);
      data="Error: html template for 'Lamp' not found"; // this is what will be returned for each instance
    }
    logger.info("building html component for 'Lamp':\n"+jade.compile(fileData)({'id':"[id]"}));
  
    var factory = function (id) {
      logger.info("building html component for 'Lamp':"+id);
      this.content = this.jadeCompile({'id':id});
      logger.info("building message receiver for 'Lamp':"+id);
      io.sockets.on('DCU_'+id, function (data) {
        logger.info("Data received from "+id+":\n"+JSON.stringify(data));
      });
    };
  
    factory.prototype = { jadeCompile: jade.compile(fileData) };
  
    callback(err,factory);
  });
};