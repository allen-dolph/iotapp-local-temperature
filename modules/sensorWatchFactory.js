// var iotSensorWatch = require('./iotSensorWatch'),
// 	mockSensorWatch = require('./mockSensorWatch');

exports.makeSensorWatch = function(useMock) {
	if(useMock) {
		return require('./mockSensorWatch');
	} else {
		return require('./iotSensorWatch');
	}
}