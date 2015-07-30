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
    , lcd = require('jsupm_i2clcd')
    , net = require('net');

// Create the temperature sensor object using AIO pin 0
var tempSensor = new groveSensor.GroveTemp(2);
console.log(tempSensor.name());

//GROVE Kit A0 Connector --> Aio(0)
var myAnalogPin = new mraa.Aio(2);

/* 
 * Function: extHandler
 * Description: cleans up when the server is closed
 */
function exitHandler(options, err) {
    lcdDisplay.clear();
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

/*
 * Function: readTemp
 * Description: Read the temperature from the grove sensor and returns it
 * Returns: and object containing both the celsius and farienheight temps
 */
function readTemp() {
    console.log('Reading Temperature...');
    var a = myAnalogPin.read();
    console.log("Analog Pin (A0) Output: " + a);
    console.log("Checking....");

    var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
    console.log("Resistance: "+resistance);
    
    //var celsiusTemperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
    var cTemp = tempSensor.value();
    console.log("Celsius Temperature " + cTemp); 
    
    var fTemp = (cTemp * (9 / 5)) + 32;
    console.log("Fahrenheit Temperature: " + fTemp);

    var tempData = {
        celsius : cTemp,
        fahrenheit : fTemp
    };

    return tempData; 
}

/*
 * Function: startSensorWatch(socket)
 * Parameters: socket - client communication channel
 * Description: Read Temperature Sensor and send temperature in degrees of Fahrenheit every 4 seconds
*/
function startSensorWatch(socket) {
    'use strict';
    console.log("Starting Temp Sensor Watch for socket: " + socket.name);
    var sender = setInterval(function () {
        var data = readTemp();
        console.log(socket.readyState);
        
        if(socket.readyState == "open") {
            socket.write(JSON.stringify(data));
        } else {
            clearInterval(sender);
        }
    }, 4000);
}

/*
 * Function: startTemperatureDisplay
 * Description: continually updates the lcd with the temperature
 */
function startTemperatureDisplay() {
    'use strict';
    console.log("Starting Temp Sensor LCD display updates");
    var updater = setInterval(function() {
        var data = readTemp();
        console.log("Current Temp: " + data.fahrenheit);

        // now update the display
        lcdDisplay.clear();
        lcdDisplay.home();
        lcdDisplay.write("C: " + data.celsius + "  F: " + data.fahrenheit);
    }, 1000);
}

console.log("Reading Grove Kit Temperature Sensor");

var clients = [];

// setup the display
var lcdDisplay = new lcd.Jhd1313m1(0); //, 0x3E, 0x62);  
lcdDisplay.setColor(64,255,64);
lcdDisplay.home();
lcdDisplay.write("Node Thermostat")
lcdDisplay.setCursor(1,0);
lcdDisplay.write("Initializing...");

startTemperatureDisplay();

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

// setup our exit handlers
//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

