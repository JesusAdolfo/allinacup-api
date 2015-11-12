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

      //TODO: verificar si el room al que se va a unir el socket existe!
      if (index >= 0 || data.channel != room) {
        blackList[index].socketID = socket.id;
        io.to(socket.id).emit('was kicked', "you were kicked!");
        return;
      }

      socket.join(data.channel);

      socket.username = data.username;
      var newUser ={
        socketID: socket.id,
        username: socket.username,
        nickName: data.nickName,
        channel: data.channel
      };

      usersOnline.push(newUser);

      console.log('usersOnline', usersOnline);
      io.to(newUser.socketID).emit('users', usersOnline);
      //io.sockets.in(room).emit('cant users',usersOnline.length)
      console.log('data to send', data);
      socket.broadcast.to(room).emit('new user', newUser);
    });

    socket.on('connected users', function (username) {
      var user = _.find(usersOnline, 'username', username);

      io.to(user.socketID).emit('users', usersOnline);

    });

    socket.on('blacklist users', function (username) {
      var user = _.find(usersOnline, 'username', username);

      io.to(user.socketID).emit('black users', blackList);

    });

    socket.on('send message', function (data) {

      //TODO: save and send {username:user,nickName:nickname,message:message}
      console.log('message to send', data);
      chatModel.create({sender: data.username, message: data.message}, function (err, result) {

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

      socket.broadcast.to(room).emit('user kicked',user);

      io.to(user.socketID).emit('was kicked', "you were kicked!");

    });

    socket.on('restore user', function (username) {
      var user = _.find(blackList, 'username', username);
      console.log('restore username: ', user);
      try {
        //socket.broadcast.to(room).emit('user restored', {username:user.username,usersOnline:usersOnline});
        io.to(user.socketID).emit('was restored', "you were restored!");
      }
      catch (exception) {}

      _.remove(blackList, function (user) {
        return user.username == username;
      });
    });


    socket.on('disconnect', function () {

      _.remove(usersOnline, function (user) {
        return user.username == socket.username;
      });

      console.log('discconnect', socket.username);
      io.sockets.in(room).emit('user disconnected',socket.username);
      //socket.broadcast.to(room).emit('user down',data.user);
    });

    /*socket.on('join to room',function(channel){
     socket.leave(room);
     socket.join(channel);

     });*/

  });

};
