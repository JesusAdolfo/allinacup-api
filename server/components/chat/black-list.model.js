'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

var BlackListSchema = new Schema({
  sender: String,
  message: String,
  sent_at: { type: Date, default:new Date() }
});

BlackListSchema.plugin(autoIncrement.plugin, 'BlackList');


module.exports = mongoose.model('BlackList', BlackListSchema);
