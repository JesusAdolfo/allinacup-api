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
var User = require('./../../api/user/user.model');
//var blackListModel = require('./black-list.model');
module.exports = function (io) {

  io.on('connection', function (socket) {

    socket.on('init chat', function (data) {
      data.channel = 'default';
      var found = false;
      _.forEach(usersOnline, function (user) {
        if(user.username == data.username){
          user.socketID = socket.id;
          delete user.timeout;
          found = true;
        }

      });
      if(found)
        return;

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
      socket.nickName = data.nickName;
      var newUser ={
        socketID: socket.id,
        username: socket.username,
        nickName: data.nickName,
        channel: data.channel
      };

      _.remove(usersOnline, function (user) {
        return user.username == socket.username;
      });

      usersOnline.push(newUser);
      console.log('---------init chat----------');
      console.log('usersOnline', usersOnline);
      io.to(newUser.socketID).emit('users', usersOnline);
      //io.sockets.in(room).emit('cant users',usersOnline.length)
      console.log('data to send', data);
      console.log('---------init chat----------');
      socket.broadcast.to(room).emit('new user', newUser);
    });

    socket.on('change nickName', function (nickName) {




      socket.broadcast.to(room).emit('user nickName changed',
        {username:socket.username,
        oldNick:socket.nickName,
        newNick:nickName
        }
      );

      socket.nickName = nickName;

    });

    socket.on('connected users', function (username) {
      //var user = _.find(usersOnline, 'username', username);

      User.findOne({email:username}, function (err, user) {
        if(err) return;
        if(!user) return;
        if(user.role == 'admin')
          io.to(user.socketID).emit('users', usersOnline);
      });
    });

    socket.on('blacklist users', function (username) {
      //var user = _.find(usersOnline, 'username', username);

      User.findOne({email:username}, function (err, user) {
        if(err) return;
        if(!user) return;
        if(user.role == 'admin')
          io.to(user.socketID).emit('black users', blackList);
      });

    });

    socket.on('send message', function (data) {
      console.log('---------send message----------');
      console.log('message to send', data);
      console.log('--------send message-----------');
      chatModel.create({sender: data.username, message: data.message}, function (err, result) {

      });
      socket.broadcast.to(room).emit('new message', data);

    });

    socket.on('kick user', function (username) {

      var user = _.find(usersOnline, 'username', username);
      console.log('kick username: ', user);
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

    socket.on('chat disconnect', function () {

      socket.leave(room);
      _.remove(usersOnline, function (user) {
        return user.username == socket.username;
      });
      console.log('---------chat disconnect----------');
      console.log({username:socket.username,nickName:socket.nickName});

      io.sockets.in(room).emit('user disconnected',{username:socket.username,nickName:socket.nickName});
      console.log('sent');
      console.log('---------chat disconnect----------');
    });

    socket.on('disconnect', function () {
      var instance = null;
      _.forEach(usersOnline, function (user) {
        if(user.username == socket.username){
          user.timeout = true;
          instance = user;
        }
      });
      console.log('---------disconnect----------');
      console.log(socket.username);
      console.log(instance);
      console.log('---------disconnect----------');
      if(instance)
      setTimeout(function () {
        var user = _.find(usersOnline, 'username', instance.username);
        console.log(user);
        if(user.timeout){
          _.remove(usersOnline, function (user) {
            return user.username == user.username;
          });
          console.log('---------setTimeout----------');
          console.log(user.username);
          console.log('---------setTimeout----------');
          io.sockets.in(room).emit('user disconnected',{username:user.username,nickName:user.nickName});
        }

      }, 30000);

      //socket.broadcast.to(room).emit('user down',data.user);
    });

    /*socket.on('join to room',function(channel){
     socket.leave(room);
     socket.join(channel);

     });*/

  });

};
