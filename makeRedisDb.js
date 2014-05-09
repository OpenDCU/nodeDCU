var redis = require('redis').createClient();

console.log("Boo!");
redis.hset("DCU:pages", 1, '{"value":["lamp123","lamp124"]}');
