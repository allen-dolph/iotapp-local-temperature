
var SERVER_IP = "127.0.0.1";

var net = require('net');

var client = new net.Socket();


client.on('data', function(data) {
	console.log('Received: ' + data.toString('utf-8'));

});

client.on('close', function() {
	console.log('Connection closed');
});

client.connect(1337, SERVER_IP, function() {
	console.log('Connected');
	client.write('Hello, server from client.');
});