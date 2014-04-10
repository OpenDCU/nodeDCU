nodeDCU
=======

NodeDCU is an experimental implementation of OpenDCU using node.js. The architecture consists of:

* A single server for the cluster, responsible for passing messages between other connected entities, and for serving web pages etc to allow UI devices to be instantiated.
* One "master" for each device; this may be the source of data for a sensor, or the controller for an actuator.
* Multiple "clients" for devices; these may display sensor data, or send state-change requests to actuator masters.

The server and masters may run on any linux system; the intended target is Raspberry Pi; I develop on Ubuntu.

In the current code, clients are all web pages. Up-to-date browsers are recommended; we've not yet done the work to ensure support for historical browser versions.

Installing
----------
###Clone this git repo

    git clone https://github.com/OpenDCU/nodeDCU.git

will create a directory called nodeDCU in whichever location you execute that command. You can then

    cd nodeDCU


###Node.js

Node.js is a non-browser javascript envirinment, becoming popular for server implementations. The OpenDCU code has both a server and a "master" implementation running under node.

Node.js releases change rapidly. We're working on v0.10.26. Versions 0.9.xx and below are known to have problems, which means that the current debian/ubuntu repository is not good enough (as of April 2014).

For x86 Linux, http://nodejs.org/ has useful instructions. For the Pi, recent versions (April 2014) seem to have compile issues. https://gist.github.com/adammw/3245130 has instructions on installing a working set-up on the Pi.


###Redis

Redis is a low-overhead key-value database. It is used by the server to store persistent state.

For Ubuntu, the preferred approach is

    sudo apt-get install -y python-software-properties
    sudo add-apt-repository -y ppa:rwky/redis
    sudo apt-get update
    sudo apt-get install -y redis-server

This gets you a much newer version than the standard repository version. (instructions relevent as of Dec 2013).

For Raspberry Pi, instructions at http://redis.io/download are the best option.

At the moment, there is no way to edit the page layout for clients, other than poking the rediis database. There is a program to seed the database with some useful data:

    node makeRedisDb.js

(Currently, this sets up one page: `<host>/page/1`, with two lamps: `DCU_lamp123` and `DCU_lamp124`


