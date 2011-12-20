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


var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);


function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
	socket.on('my other event', function (data) {
		console.log(data);
	});
});



var states = {
	PAUSE: 0,
	RUNNING: 1,
	ENDING: 2,
	END: 3
};

var game = {
	state: states.PAUSE,
	time: 0,
	fails: 0
};

function sendGameData() {
	io.sockets.emit('game', { game: game });
}

serialPort.on("data", function (data) {
	switch(data) {
		case "go":
			console.log("Start");
			game.time = 0;
			game.state = states.RUNNING;
			break;
		case "stop":
			game.state = states.ENDING;
			break;
		default: 
			switch(game.state) {
				case states.ENDING:
					game.fails = data;

					console.log("Fertig");
					console.log("Fails: " + game.fails);
					console.log("Zeit: " + game.time + "ms");

					game.state = states.END;					
					break;
				case states.RUNNING:
					if(data != "fail") {
						game.time += parseInt(data);
					}
					break;
			}
			break;
	}
	
	sendGameData();
	if(game.state == states.END) {
		game.state = states.PAUSE;
		game.fails = 0;
		game.time = 0;
	}
});


