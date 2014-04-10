nodeDCU
=======

NodeDCU is an experimental implementation of OpenDCU using node.js. The architecture consists of:

* A single server for the cluster, responsible for passing messages between other connected entities, and for serving web pages etc to allow UI devices to be instantiated.
* One "master" for each device; this may be the source of data for a sensor, or the controller for an actuator.
* Multiple "clients" for devices; these may display sensor data, or send state-change requests to actuator masters.

Installing
----------
###Node.js

Node.js is a non-browser javascript envirinment, becoming popular for server implementations. The OpenDCU code has both a server and a "master" implementation running under node.

###Redis

Redis is a low-overhead key-value database. It is used by the server to store persistent state.

For Ubuntu, the preferred approach is

    sudo apt-get install -y python-software-properties
    sudo add-apt-repository -y ppa:rwky/redis
    sudo apt-get update
    sudo apt-get install -y redis-server

This gets you a much newer version than the standard repository version. (instructions relevent as of Dec 2013).

For Raspberry Pi, instructions at http://redis.io/download are the best option.


