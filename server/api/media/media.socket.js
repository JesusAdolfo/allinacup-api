/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Media = require('./media.model');

exports.register = function(socket) {
  Media.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Media.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('media:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('media:remove', doc);
}