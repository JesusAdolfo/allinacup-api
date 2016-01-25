/* global io */
'use strict';

angular.module('restaurantApp')
  .factory('socket', function(socketFactory) {

    // socket.io now auto-configures its connection when we ommit a connection url
    /*var ioSocket = io('http://localhost:9000', {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
      //path: '/socket.io/socket.io.js'
    });*/

    var ioSocket = socketFactory();

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,
      chatInit: function (data) {
        socket.emit('init chat',data);
      },
      kick: function (data) {
        socket.emit('kick user',data);
      },
      wasKicked: function (cb) {
        cb = cb || angular.noop;
        /**
         * Syncs client-request new
         */
        socket.on('was kicked', function (item) {
          cb(item);
        });
      },
      sedMessage: function (data) {
        socket.emit('send message',data);
      },
      receiveMessage: function (cb) {
        cb = cb || angular.noop;
        /**
         * Syncs client-request new
         */
        socket.on('new message', function (item) {
          cb(item);
        });
      },
      notifiNewUser: function (cb) {
        cb = cb || angular.noop;
        /**
         * Syncs client-request new
         */
        socket.on('new user', function (item) {
          cb(item);
        });
      },
      getNewOrders: function(cb){
        cb = cb || angular.noop;
        /**
         * Syncs client-request new
         */
        socket.on('client-request new', function (item) {
          cb(item);
        });
      },
      orderProcessed: function(cb){
        cb = cb || angular.noop;
        /**
         * Syncs client-request new
         */
        socket.on('order-processed', function (item) {
          cb(item);
        });
      },

      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      },
      unsyncNewOrders: function () {
        socket.removeAllListeners('client-request new');
      }
    };
  });
