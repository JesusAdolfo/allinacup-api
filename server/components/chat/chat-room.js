/**
 * Created by ChristianFernando on 10/31/2015.
 */
'use strict';

var _ = require('lodash');
var utils = require('../utils');
var users = [];
var room = "default";
var messages = [];
var blackList = [];
module.exports = function (io) {

  io.on('connection', function (socket) {

    socket.on('init chat', function (data) {
      data.channel ='default';
      var index = _.findIndex(blackList, function (user) {
        return user == data.username;
      });
	console.log('data',data);
      //TODO: verificar si el room al que se va a unir el socket existe!
      if (index >= 0 || data.channel != room) return;

      socket.join(data.channel);

      socket.username = data.username;
      users.push({
        socketID: socket.id,
        username: socket.username,
        channel: data.channel
      });

      //console.log('socket id',socket.id);
      console.log('users', users);
      //io.sockets.in('room')emit('key',data)
console.log('data to send',data);
      socket.broadcast.to(room).emit('new user', data.username);
    });


    socket.on('send message', function (data) {

      //TODO: save and send {user:user,message:message}

      socket.broadcast.to(room).emit('new message', data);

    });


    socket.on('kick user', function (username) {

      console.log('username: ', username);

      var user = _.find(users, 'username', username);
      //console.log('user: ',io.sockets.connected[user.socketID]);
      if (!user) return;

      blackList.push(user.username);

      _.remove(users, function (user) {
        return user.username == username;
      });

      io.sockets.connected[user.socketID].leave(user.channel);

      socket.broadcast.to(room).emit('user kicked', user.username);

      io.to(user.socketID).emit('was kicked', "you were kicked!");

    });


    socket.on('disconnect', function () {

      _.remove(users, function (user) {
        return user.username == socket.username;
      });

      console.log('discconnect', socket.username);

      //socket.broadcast.to(room).emit('user down',data.user);
    });

    /*socket.on('join to room',function(channel){
     socket.leave(room);
     socket.join(channel);

     });*/

  });

};
