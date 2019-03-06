// dependencies
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

// socket.io
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// database 
var mongoose = require('mongoose');
var mongoose = require('mongoose');
var config = require("./config/db");

// model schema for database
var Message = require('./models/chat');
var Event = require('./models/event')

// chat route (commands to read db)
var chatRoute = require('./routes/chatRoute')
var eventRoute = require('./routes//eventRoute')
app.use('/api', chatRoute);
// app.use('/api', chatRoute);

// middleware
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

// routing
app.post('/messages', async (req, res) => {
	try{
	  var message = new Message(req.body);
  
	  var savedMessage = await message.save()
		console.log('saved');
  
	  var censored = await Message.findOne({message:'badword'});
		if(censored)
		  await Message.remove({_id: censored.id})
		else
		  io.emit('message', req.body);
		res.sendStatus(200);
	}
	catch (error){
	  res.sendStatus(500);
	  return console.log('error',error);
	}
	finally{
	  console.log('Message Posted')
	}
  
})
// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['Main Room', 'No Boys Allowed', 'No Girls Allowed'];

// socket.io
io.sockets.on('connection', function (socket) {
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'Main Room';
		// add the client's username to the global list
		usernames[username] = username;
		// send client to room 1
		socket.join('Main Room');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to the Main Room');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('Main Room').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'Main Room');
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});
	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

// database
mongoose.Promise = global.Promise;
mongoose.connect(config.DB, { useNewUrlParser: true }).then(
  () => {console.log('Database is now connected') },
  err => { console.log('Can not connect to the database '+ err)}
);

// run on server
var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
  console.log('http://localhost:3000');
});
