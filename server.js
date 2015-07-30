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

var B = 3975
    , mraa = require("mraa")
    , groveSensor = require('jsupm_grove')
    , lcd = require('jsupm_i2clcd');
    
// Load Grove module
//var groveSensor = require('jsupm_grove');

// Create the temperature sensor object using AIO pin 0
//var tempSensor = new groveSensor.GroveTemp(0);
//console.log(tempSensor.name());

var net = require('net');

//GROVE Kit A0 Connector --> Aio(0)
var myAnalogPin = new mraa.Aio(2);

/*
Function: startSensorWatch(socket)
Parameters: socket - client communication channel
Description: Read Temperature Sensor and send temperature in degrees of Fahrenheit every 4 seconds
*/
function startSensorWatch(socket) {
    'use strict';
    console.log("Starting Temp Sensor Watch for socket: " + socket.name);
    setInterval(function () {
        console.log('Reading Temperature...');
        var a = myAnalogPin.read();
        console.log("Analog Pin (A0) Output: " + a);
        console.log("Checking....");
        
        var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
        console.log("Resistance: "+resistance);
        var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
        console.log("Celsius Temperature "+celsius_temperature); 
        var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
        console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
        socket.emit("message", fahrenheit_temperature);

        var data = {
            celsius : celsius_temperature,
            fahrenheit : fahrenheit_temperature
        };

        socket.write(JSON.stringify(data));
    }, 4000);
}

console.log("Reading Grove Kit Temperature Sensor");

//Create Socket.io server
// var http = require('http');
// var app = http.createServer(function (req, res) {
//     'use strict';
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     res.end('<h1>Hello world from Intel IoT platform!</h1>');
// }).listen(1337);
// var io = require('socket.io')(app);


var clients = [];

var server = net.createServer(function(socket) {

    socket.name = socket.remoteAddress + ";" + socket.remortePort;

    clients.push(socket);

    startSensorWatch(socket);

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


//Attach a 'connection' event handler to the server
// io.on('connection', function (socket) {
//     'use strict';
//     console.log('a user connected');
//     //Emits an event along with a message
//     socket.emit('connected', 'Welcome');

//     //Start watching Sensors connected to Galileo board
//     startSensorWatch(socket);

//     //Attach a 'disconnect' event handler to the socket
//     socket.on('disconnect', function () {
//         console.log('user disconnected');
//     });
// });

