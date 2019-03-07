/***
 *
 *     _____ _____ _____ _____ _____ _____   _
 *    |   __|     |     |  |  |   __|_   _| |_|___
 *    |__   |  |  |   --|    -|   __| | |  _| | . |
 *    |_____|_____|_____|__|__|_____| |_| |_|_|___|
 *
 */
// model schema for database
var Chat = require('../models/chat');
var Event = require('../models/event')
var usernames = {};
var rooms = ['Main Room', 'No Boys Allowed', 'No Girls Allowed'];

module.exports = (io) => {
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
         // SAVE TO DATABASE
         var event = new Event({name: socket.username, room: socket.room, event:'connected'});
         event.save();
     });
     
     // when the client emits 'sendchat', this listens and executes
     socket.on('sendchat', function (data) {
         // we tell the client to execute 'updatechat' with 2 parameters
         io.sockets.in(socket.room).emit('updatechat', socket.username, data);
         // SAVE TO DATABASE
         var chat = new Chat({name: socket.username, message: data, room: socket.room});
         chat.save();
         var event = new Event({name: socket.username, room: socket.room, event:'posted a message'});
         event.save();
     });
     
     socket.on('switchRoom', function(newroom){
         socket.leave(socket.room);
         socket.join(newroom);
         socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
         // sent message to OLD room
         socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
         // SAVE TO DATABASE
         var event = new Event({name: socket.username, room: socket.room, event:`left ${socket.room}`});
         event.save();
         // update socket session room title
         socket.room = newroom;
         socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
         socket.emit('updaterooms', rooms, newroom);
         // SAVE TO DATABASE
         var event = new Event({name: socket.username, room: socket.room, event:`joined ${socket.room}`});
         event.save();
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
         // SAVE TO DATABASE
         var event = new Event({name: socket.username, room: socket.room, event:'disconnected'});
         event.save();
     });
 });
}