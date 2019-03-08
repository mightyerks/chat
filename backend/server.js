// dependencies
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

// socket.io
var http = require('http').createServer(app);
var io = require('socket.io')(http);
require('./socket/socket')(io);

// database 
var mongoose = require('mongoose');
var config = require("./config/db");

// chat route (commands to read db)
var router = require('./routes/router')
// express api route
app.post('/api/roomhistory?', router);
// express api route
app.get('/api/history', router);
// express api route
app.get('/api/eventlog', router);

// middleware
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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