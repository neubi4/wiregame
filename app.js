#!/usr/bin/env node

var program = require('commander');
var sys = require('util');

program
	.version('0.0.1')
	.option('-i, --ttyinterface [interface]', 'Took this interface [/dev/ttyUSB0]', '/dev/ttyUSB0')
	.parse(process.argv);


var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var serialPort = new SerialPort(program.ttyinterface, {
	parser: serialport.parsers.readline("\n\r")
});

var states = {
	PAUSE: 0,
	RUNNING: 1,
	ENDING: 2
};

var game_status = states.PAUSE;
var time = 0;
var fails = 0;

serialPort.on("data", function (data) {

	switch(data) {
		case "go":
			console.log("Start");
			time = 0;
			game_status = states.RUNNING;
			break;
		case "stop":
			game_status = states.ENDING;
			break;
		default: 
			switch(game_status) {
				case states.ENDING:
					fails = data;

					console.log("Fertig");
					console.log("Fails: " + fails);
					console.log("Zeit: " + time + "ms");

					game_status = states.PAUSE;
					fails = 0;
					time = 0;
					break;
				case states.RUNNING:
					if(data != "fail") {
						time += parseInt(data);
					}
					break;
			}
			break;
	}
});


