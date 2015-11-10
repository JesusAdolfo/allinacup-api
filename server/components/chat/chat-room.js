/**
 * Created by ChristianFernando on 10/31/2015.
 */
'use strict';

var _ = require('lodash');
var utils = require('../utils');
var usersOnline = [];
var room = "default";
var messages = [];
var blackList = [];
var chatModel = require('./chat.model');
//var blackListModel = require('./black-list.model');
module.exports = function (io) {

  io.on('connection', function (socket) {

    socket.on('init chat', function (data) {
      data.channel = 'default';
      var index = _.findIndex(blackList, function (user) {
        return user.username == data.username;
      });


      console.log('data', data);
      //TODO: verificar si el room al que se va a unir el socket existe!
      if (index >= 0 || data.channel != room){
        blackList[index].socketID = socket.id;
        return;
      }

      socket.join(data.channel);

      socket.username = data.username;
      usersOnline.push({
        socketID: socket.id,
        username: socket.username,
        channel: data.channel
      });

      //console.log('socket id',socket.id);
      console.log('usersOnline', usersOnline);
      //io.sockets.in('room')emit('key',data)
      console.log('data to send', data);
      socket.broadcast.to(room).emit('new user', data.username);
    });


    socket.on('send message', function (data) {

      //TODO: save and send {user:user,message:message}
      console.log('message to send', data);
      chatModel.create({sender: data.user, message: data.message}, function (err, result) {

      });
      socket.broadcast.to(room).emit('new message', data);

    });


    socket.on('kick user', function (username) {

     var user = _.find(usersOnline, 'username', username);
      console.log('kick username: ', user);
      //console.log('user: ',io.sockets.connected[user.socketID]);
      if (!user) return;

      blackList.push(user);

      _.remove(usersOnline, function (user) {
        return user.username == username;
      });

      io.sockets.connected[user.socketID].leave(user.channel);

      socket.broadcast.to(room).emit('user kicked', user.username);

      io.to(user.socketID).emit('was kicked', "you were kicked!");

    });

    socket.on('restore user', function (username) {
      var user = _.find(blackList, 'username', username);
      console.log('restore username: ', user);
      io.to(user.socketID).emit('was restored', "you were restored!");

      _.remove(blackList, function (user) {
        return user.username == username;
      });
    });


    socket.on('disconnect', function () {

      _.remove(usersOnline, function (user) {
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
