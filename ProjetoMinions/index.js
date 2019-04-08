/*

Main file for the server

Author: Raul Rosá
Created on: Friday, 05/04/2019

Objectives:


*/


// MODULES AND DEPENDENCIES
const express = require('express')
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
const path = require('path');
const router = express.Router();


// VARIABLES
var connections = [];

// FUNCTIONS AND EVENTS

server.listen(process.env.PORT || 8000);

io.on('connection', function(socket){
	
	connections.push(socket); //add socket to active connections
	console.log('Connected: %s sockets connected', connections.length);

	//treating disconnection
	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);

		console.log('Disconnected: %s sockets connected', connections.length);
	});
});



// ROUTER

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
});

//Adds static paths to the folders the files will reference
app.use('/img', express.static('img'))
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))

//add the router
app.use('/', router);

// SERVER MESSAGES

console.log('Server running at Port 8000');