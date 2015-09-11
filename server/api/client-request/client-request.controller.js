'use strict';

var _ = require('lodash');
var ClientRequest = require('./client-request.model');
var User = require('./../user/user.model');
var Product = require('./../product/product.model');

// Get list of client_requests
exports.index = function(req, res) {
  ClientRequest.find(function (err, client_requests) {
    if(err) { return handleError(res, err); }
    //||join con un solo registro de una tabla
    //||params:
    //||1: data ,2: respuesta, 3: iteraciones, 4: arreglo resultante
    //||
    //||ejem: [{idPadre:1,idHijo:id:1}, {idPadre:2,idHijo:id:1}
    //||result: [ { Padre:{ idPadre:1, idHijo:1 }, Hijos: { id:1, atributos } },
    //||{ Padre:{ idPadre:1, idHijo:1 }, Hijo: { id:1, atributos } } ]
    return joinWithUsers (client_requests, res, client_requests.length, []);
  });
};

var joinWithUsers = function(client_requests,res,stop,result){
   User.findById(client_requests[stop-1].idUser, function (err, user) {

        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');

        result.push({request:client_requests[stop-1],user:user.profile,car:[]});
        stop--;
        if(stop==0)
          //||join con un varios registros de una tabla
          //||params:
          //||1: data ,2: respuesta, 3: iteraciones del padre, 4: iteraciones de los id seran utilizados para el join
          //||
          //||ejem: [ { idPadre:1,idHijos:[{id:1}, {id:2}]}, {idPadre:2,idHijos:[{id:1}, {id:2}] } ]
          //||result: [ { Padre:{idPadre:1, idHijos:[{id:1},{id:2}] }, Hijos:[ {id:1, atributos},{id:2, atributos} ] },
          //|| { Padre:{ idPadre:2, idHijos:[{id:1},{id:2}] }, Hijos:[ {id:1, atributos},{id:2, atributos} ] } ]
          return joinWithProducts(result, res, result.length, result[result.length-1].request.car.length);
        if(stop>0)
          joinWithUsers(client_requests, res, stop, result);
      
      });
}

var joinWithProducts = function (r,res,stop,count){
  //var count=r[stop-1].request.car.length;
  Product.findById(r[stop-1].request.car[count-1].id, function (err, product) {
    //console.log('r==>',product);
    r[stop-1].car.push(product);
    count--;
    if(count>0){
      return joinWithProducts(r,res,stop,count);
    }
    if(count==0){
      stop--;
       if (stop==0) { console.log('res==>',r);return res.status(200).json(r);};
      count = r[stop-1].request.car.length
      return joinWithProducts(r,res,stop,count);
    }
    
  });
};

// Get a single client_request
exports.show = function(req, res) {
  ClientRequest.findById(req.params.id, function (err, client_request) {
    if(err) { return handleError(res, err); }
    if(!client_request) { return res.status(404).send('Not Found'); }
    return res.json(client_request);
  });
};

// Creates a new client_request in the DB.
exports.create = function(req, res) {
  ClientRequest.create(req.body, function(err, client_request) {
    if(err) { return handleError(res, err); }
    return joinWithUsers ([client_request], res, 1, []);//res.status(201).json(client_request);//exports.index(req, res);
  });
};

// Updates an existing client_request in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  ClientRequest.findById(req.params.id, function (err, client_request) {
    if (err) { return handleError(res, err); }
    if(!client_request) { return res.status(404).send('Not Found'); }
    var updated = _.merge(client_request, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(client_request);
    });
  });
};

// Deletes a client_request from the DB.
exports.destroy = function(req, res) {
  ClientRequest.findById(req.params.id, function (err, client_request) {
    if(err) { return handleError(res, err); }
    if(!client_request) { return res.status(404).send('Not Found'); }
    client_request.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}