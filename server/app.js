/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');


// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(-1);
	}
);
// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);

/*var socketio = require('socket.io')(server, {
  //serveClient: config.env !== 'production',
  //path: '/socket.io-client'
});*/
var socketio = require('socket.io')(server);

require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

require('./api/client-request/client-request.controller').register(socketio);

require('./components/chat/chat-room')(socketio);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

//multiparty
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: "./server/img" });
 /* app.use(multipart({
        uploadDir: "./server/img"
    }));
*/
app.post('/upload', multipartMiddleware, function(req, res) {
  console.log(req.body, req.files);
  // don't forget to delete all req.files when done
  res.status(201).json({});
});

// Expose app
module.exports = app;
