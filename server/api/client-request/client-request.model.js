'use strict';
var utils = require('./../../components/utils/index.js');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var now = new Date()
var courrentTimeStamp = utils.getCurrentDate(now)+" "+utils.getCurrentTime(now);
var ClientRequestSchema = new Schema({
  idUser: String,
  car: [],
  status:String,
  createdAt: {type:String, default:courrentTimeStamp}
});

module.exports = mongoose.model('ClientRequest', ClientRequestSchema);