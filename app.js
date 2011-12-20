#!/usr/bin/env node

var program = require('commander');

program
	.version('0.0.1')
	.option('-i, --ttyinterface [interface]', 'Took this interface [/dev/tty1]', '/dev/tty1')
	.parse(process.argv);


var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort(program.ttyinterface, {
	parser: serialport.parsers.readline("\n\r")
});

var states = {
	PAUSE: 0,
	RUNNING: 1
};

serialPort.on("data", function (data) {
	sys.puts("daten: " + data);
});


