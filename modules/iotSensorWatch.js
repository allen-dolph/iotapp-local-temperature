var B = 3975
    , mraa = require("mraa")
    , groveSensor = require('jsupm_grove')
    , lcd = require('jsupm_i2clcd')
    , temperatureApi = require('./temperatureApiWrapper');

// Create the temperature sensor object using AIO pin 0
var tempSensor = new groveSensor.GroveTemp(2);
console.log(tempSensor.name());

//GROVE Kit A0 Connector --> Aio(0)
//var myAnalogPin = new mraa.Aio(0);

// setup the display
var lcdDisplay = new lcd.Jhd1313m1(0); //, 0x3E, 0x62);  
lcdDisplay.setColor(64,255,64);
lcdDisplay.home();
lcdDisplay.write("Node Thermostat")
lcdDisplay.setCursor(1,0);
lcdDisplay.write("Initializing...");

/*
 * Function: readTemp
 * Description: Read the temperature from the grove sensor and returns it
 * Returns: and object containing both the celsius and farienheight temps
 */
var readTemp = function() {
	console.log('Reading Temperature...');
    //var a = myAnalogPin.read();
    //console.log("Analog Pin (A0) Output: " + a);
    //console.log("Checking....");

    //var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor;
    //console.log("Resistance: "+resistance);
    
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

module.exports = {
	 
	/*
	 * Function: startTemperatureDisplay
	 * Description: continually updates the lcd with the temperature
	 */
	startTemperatureDisplay : function(deviceSerialNumber) {
	    'use strict';
	    console.log("Starting Temp Sensor LCD display updates");
	    var updater = setInterval(function() {
	        var data = readTemp();
	        console.log("Current Temp: " + data.fahrenheit);

	        // now update the display
	        lcdDisplay.clear();
	        lcdDisplay.home();
	        lcdDisplay.write("C: " + data.celsius + "  F: " + data.fahrenheit);

	        // also post to the temperature backend
	        var temperatureObj = {
	        	celciusTemperature : data.celsius,
	        	fahrenheitTemperature: data.fahrenheit,
	        	deviceSerialNumber: deviceSerialNumber,
	        	unixTimestamp: Math.floor(Date.now() / 1000)
	        };

	        // set content-type header and data as json in args parameter 
			var args = {
			  data: temperatureObj,
			  headers:{"Content-Type": "application/json"} 
			};

			console.log('Posting temp data to cloud enpoints...');
	        temperatureApi.client.methods.postTemperature(args, function(data,response){
			    // parsed response body as js object 
			    console.log(data.toString('utf-8'));
			    // raw response 
			    //console.log(response);
			});

	    }, 1000);
	},
	/*
	 * Function: startSensorWatch(socket)
	 * Parameters: socket - client communication channel
	 * Description: Read Temperature Sensor and send temperature in degrees of Fahrenheit every 4 seconds
	*/
	startSensorWatch : function(socket) {
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

}