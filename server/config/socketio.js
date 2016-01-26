/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var utils = require('../components/utils');
// When the user disconnects.. perform this
function onDisconnect(socket) {
  console.log('\x1b[1m\x1b[32m');
  console.log('El socket %s se ha desconectado.', socket.id);
  console.log('\x1b[0m');
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  /*socket.on('info', function (data) {
    console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });*/
var ipClient=socket.request.connection.remoteAddress.substring(socket.request.connection.remoteAddress.lastIndexOf(":")+1,socket.request.connection.remoteAddress.length);

  console.log('\x1b[1m\x1b[33m');
  console.log('Socket conectado desde %s el %s a las %s con el id %s',ipClient, utils.getCurrentDate(socket.connectedAt),utils.getCurrentTime(socket.connectedAt),socket.id);
  console.log('\x1b[0m');
  //socket.emit('client-request new', 'data');
  // Insert sockets below
  require('../api/media/media.socket').register(socket);
  require('../api/client-request/client-request.socket').register(socket);
  //require('../api/client-request/client-request.controller').register(socket);
  require('../api/product/product.socket').register(socket);
  require('../api/thing/thing.socket').register(socket);
}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', function (socket) {

    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    //manejo de los id de los sockects de cada usuario!!!

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      //console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket);
    //console.info('[%s] CONNECTED', socket.address);
  });
};
