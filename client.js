
var net = require('net');
var argv = require('minimist')(process.argv.slice(2));

var client = new net.Socket();
var SERVER_IP = argv.i || "127.0.0.1";
var PORT = argv.p || 1337;

client.on('data', function(data) {
	console.log('Received: ' + data.toString('utf-8'));
});

client.on('close', function() {
	console.log('Connection closed');
});

client.connect(1337, SERVER_IP, function() {
	console.log('Connected');
	client.write('Hello from client.');
});