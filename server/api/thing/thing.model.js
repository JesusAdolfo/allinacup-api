'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');
    
autoIncrement.initialize(mongoose);

var ThingSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

ThingSchema.plugin(autoIncrement.plugin, 'Thing');


module.exports = mongoose.model('Thing', ThingSchema);