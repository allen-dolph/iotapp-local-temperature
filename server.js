/*jslint node:true,vars:true,bitwise:true,unparam:true */

/*jshint unused:true */

/*
The Local Temperature Node.js sample application distributed within Intel® XDK IoT Edition under the IoT with Node.js Projects project creation option showcases how to read analog data from a Grover Starter Kit Plus – IoT Intel® Edition Temperature Sensor, start a web server and communicate wirelessly using WebSockets.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/iot-local-temperature-nodejs-and-html5-samples
*/

var net = require('net');
var argv = require('minimist')(process.argv.slice(2));
var sensorWatchFactory = require('./modules/sensorWatchFactory');

var deviceSerialNumber = '123456789';

var useMock = false;

// if -t is specifed used the sensorWatchFactory to get a mock sensor
if(argv.t) {
    useMock = true;
} 

var sensorWatch = sensorWatchFactory.makeSensorWatch(useMock);

/* 
 * Function: extHandler
 * Description: cleans up when the server is closed 
 */
function exitHandler(options, err) {
    //lcdDisplay.clear();
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

console.log("Reading Grove Kit Temperature Sensor");

var clients = [];

sensorWatch.startTemperatureDisplay(deviceSerialNumber);

var server = net.createServer(function(socket) {

    socket.name = socket.remoteAddress + ";" + socket.remortePort;

    clients.push(socket);

    sensorWatch.startSensorWatch(socket);

    console.log(socket.name + " connected");
    socket.write("Welcome " + socket.name + "\n");

    socket.on('data', function(data) {
        console.log(data.toString('utf-8'));
    });

    socket.on('disconnect', function() {
        var idx = clients.indexOf(socket);
        if(idx != -1) {
            clients.splice(idx, 1);
        }
    });

}).listen(1337);

// setup our exit handlers
//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

