/* Basic logging, designed to be compatible with winston
 * based on http://docs.nodejitsu.com/articles/intermediate/how-to-log
 */


var logger = exports;

var clc = require('cli-color');

var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.blue;

logger.log = function(level, message) {
  var levels = ['error', 'warn', 'info'];
  if (levels.indexOf(level) <= levels.indexOf(logger.debugLevel) ) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    console.log(level+': '+message);
  }
};

logger.info = function(message) {
  logger.log("info", notice(message));
};

logger.warn = function(message) {
  logger.log("warn", warn(message));
};

logger.error = function(message) {
  logger.log("error", error(message));
};