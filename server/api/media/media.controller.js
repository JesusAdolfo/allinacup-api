'use strict';

var _ = require('lodash');
var Media = require('./media.model');
var fs = require('fs');

// Get list of medias
exports.index = function(req, res) {
  Media.find(function (err, medias) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(medias);
  });
};

// Get a single media
exports.show = function(req, res) {

  var img = null;
  try{
    img = fs.readFileSync(req.query.path);
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(img, 'binary');
  }catch (ex){
    img = fs.readFileSync('./server/api/media/default-image.png');
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(img, 'binary');
  }

};

// Creates a new media in the DB.
exports.create = function(req, res) {
  Media.create(req.body, function(err, media) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(media);
  });
};

// Updates an existing media in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Media.findById(req.params.id, function (err, media) {
    if (err) { return handleError(res, err); }
    if(!media) { return res.status(404).send('Not Found'); }
    var updated = _.merge(media, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(media);
    });
  });
};

// Deletes a media from the DB.
exports.destroy = function(req, res) {
  Media.findById(req.params.id, function (err, media) {
    if(err) { return handleError(res, err); }
    if(!media) { return res.status(404).send('Not Found'); }
    media.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
