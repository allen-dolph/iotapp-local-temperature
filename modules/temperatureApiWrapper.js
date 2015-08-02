var Client = require('node-rest-client').Client;
var client = new Client();

client.registerMethod("postTemperature", 
	"https://iotapp-temperature.appspot.com/_ah/api/temperature/v1/temperature", "POST");

client.registerMethod("postLocalTemperature", 
	"http://localhost:8080/_ah/api/temperature/v1/temperature", "POST");

exports.client = client;