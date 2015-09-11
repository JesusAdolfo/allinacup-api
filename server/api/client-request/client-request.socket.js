/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var ClientRequest = require('./client-request.model');

exports.register = function(socket) {
  ClientRequest.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  ClientRequest.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('client-request:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('client-request:remove', doc);
}