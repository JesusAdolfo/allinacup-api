'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

var ChatSchema = new Schema({
  sender: String,
  message: String,
  sent_at: { type: Date, default:new Date() }
});

ChatSchema.plugin(autoIncrement.plugin, 'Chat');


module.exports = mongoose.model('Chat', ChatSchema);
