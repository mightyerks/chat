// THIS FILE IS USED FOR ACCESSING THE DATABASE WITH ITS ROUTES

var express = require('express');
var router = express.Router();

// Database Models
var Chat = require('../models/chat');
var Event = require('../models/event');

// socket.io
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// chatRoute.get('/', (req, res) => {
//     res.status(200).json({ message: 'Connected!' });
// });
// 

/*

1.  Get a list of all Chat History
    -   GET request /api/history 
    -   Returns a JSON list of chat or game history records
2.  Get a list Chat or Game History by Room Name
    -   POST request /api/roomhistory
        parameters: roomname
    -   Returns a JSON list of chat or game history for specific room name
3.  Get a list of all Events
    -   GET request /api/eventlog
    -   Returns a JSON list of all events in the event log
*/

// get all chat history
router.get('/api/history', (req, res) => {
    Chat.getChat(function (err, chats){
        if(err){
            throw err;
        }
        res.json(chats);
    });
});

// get chat history by room
router.post('/api/roomhistory', (req, res) => {
    res.send(req.body);
})

// get all eventlogs
router.get('/api/eventlog', (req, res) => {
    Event.getEvent(function (err, events){
        if(err){
            throw err;
        }
        res.json(events);
    })
})

module.exports = router;

  