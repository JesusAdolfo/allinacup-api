'use strict';

var _ = require('lodash');
var Product = require('./product.model');
var utils = require('./../../components/utils/index.js');

// Get list of products
exports.index = function(req, res) {
  Product.find(function (err, products) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(products);
  });
};

// Get a single product
exports.show = function(req, res) {
  Product.findById(req.params.id, function (err, product) {
    if(err) { return handleError(res, err); }
    if(!product) { return res.status(404).send('Not Found'); }
    return res.json(product);
  });
};

// Get a single product
exports.findByType = function(req, res) {
  Product.find({type: req.params.type.toUpperCase()}, function (err, product) {
    if(err) { return handleError(res, err); }
    if(!product) { return res.status(404).send('Not Found'); }
    return res.json(product);
  });
};
// Get types of products
exports.getTypes = function(req, res) {
  var types = ["FOOD","BEVERAGES","DESSERT"];
  return res.json({types:types});
};

// Creates a new product in the DB.
exports.create = function(req, res) {
  console.log(req.files.file);
  var result = utils.moveFromTempTo(req.files.file,'products');
  if(!result.error){
    req.body.image = result.value;
  }
  Product.create(req.body, function(err, product) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(product);
  });
  //utils.moveFromTempTo(req.files.file,'products',1);
};

// Updates an existing product in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Product.findById(req.params.id, function (err, product) {
    if (err) { return handleError(res, err); }
    if(!product) { return res.status(404).send('Not Found'); }

      var result = utils.moveFromTempTo(req.files.file,'products');
      if(result.error!=null){
        console.log(result.error);
        req.body.image = result.value;
        if(!utils.deletePath(product.image)) return res.status(500).send('image error deleting');
      }
      var updated = _.merge(product, req.body);
      product.save(updated,function (err) {
        if (err) { return handleError(res, err); }
        return res.status(200).json(product);
      });
  });
};

// Deletes a product from the DB.
exports.destroy = function(req, res) {
  Product.findById(req.params.id, function (err, product) {
    if(utils.deletePath(product.image),1){
      if(err) { return handleError(res, err); }
      if(!product) { return res.status(404).send('Not Found'); }
      product.remove(function(err) {
        if(err) { return handleError(res, err); }
        return res.status(204).send('No Content');
      });
    }else{
      return res.status(500).send('image error deleting');
    }
  });
};

function handleError(res, err) {
  console.log('err',err);
  return res.status(500).send(err);
}
