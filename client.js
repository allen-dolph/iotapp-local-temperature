var net = require('net');

var client = new net.Socket();


client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});

client.connect(1337, '192.168.1.128', function() {
	console.log('Connected');
	client.write('Hello, server! Love, Client.');
});