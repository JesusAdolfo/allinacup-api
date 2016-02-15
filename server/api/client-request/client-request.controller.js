'use strict';

var _ = require('lodash');
var ClientRequest = require('./client-request.model');
var User = require('./../user/user.model');
var Product = require('./../product/product.model');
var ClientRequestSocket = require('./client-request.socket');
var utils = require('./../../components/utils/index.js');
var ban = false;
var io;
var async = require('async')

var getClienRequest = function (client_requests, sendEmit, callback) {
  var result = [];
  Product.find({}, function (err, products) {
    async.eachSeries(client_requests, function iterator(request, callback) {
      User.findById(request.idUser, function (err, user) {
        var carTmp = [];
        _.forEach(request.car, function (car) {
          var product = _.find(products, function(item) {
            return item._id == car.id;
          });
          carTmp.push({
            _id : product._id,
            name : product.name,
            price : product.price,
            loyaltyPoints : product.loyaltyPoints,
            cant : car.cant,
            cantA : car.cantA,
            observation : car.observation
          })
        })
        result.push({
          request: request,//{_id:request._id, createdAt: request.createdAt, status: request.status},
          user:{firstName : user.firstName, lastName : user.lastName, email : user.email, phoneNumber: user.phoneNumber},
          car:carTmp
        })
        callback(null,true);
        /*async.eachSeries(request.car, function iterator(car, callback) {
         Product.findById(car.id, function (err, product) {
         carTmp.push({
         _id : product._id,
         name : product.name,
         price : product.price,
         loyaltyPoints : product.loyaltyPoints,
         cant : car.cant,
         cantA : car.cantA,
         observation : car.observation
         })
         callback(null,true);
         })

         }, function done() {
         result.push({
         request: request,//{_id:request._id, createdAt: request.createdAt, status: request.status},
         user:{firstName : user.firstName, lastName : user.lastName, email : user.email},
         car:carTmp
         })
         callback(null,true);
         })*/

      })
    }, function done() {
      if(sendEmit) io.sockets.emit('client-request new', result);
      return callback(result)
    });
  })
}

exports.register = function(socket) {
  io=socket;
}

// Get list of client_requests
exports.index = function(req, res) {
  ClientRequest.find({status:'requested'},function (err, client_requests) {
    //console.log('client_requests---->',client_requests);
    if(err) return handleError(res, err);
    if(client_requests.length==0) return res.status(200).json([]);
    //||join con un solo registro de una tabla
    //||params:
    //||1: data ,2: respuesta, 3: iteraciones, 4: arreglo resultante
    //||
    //||ejem: [{idPadre:1,idHijo:id:1}, {idPadre:2,idHijo:id:1}
    //||result: [ { Padre:{ idPadre:1, idHijo:1 }, Hijos: { id:1, atributos } },
    //||{ Padre:{ idPadre:1, idHijo:1 }, Hijo: { id:1, atributos } } ]

    //return joinWithUsers (client_requests, res, client_requests.length, []);
    getClienRequest(client_requests, false, function(result){
      return res.status(200).json(result);
    })

  });
};

// Get a single client_request
exports.show = function(req, res) {
  ClientRequest.findById(req.params.id,'-__v', function (err, client_request) {
    if(err) { return handleError(res, err); }
    if(!client_request) { return res.status(404).send('Not Found'); }
    return res.json(client_request);
  });
};

//get request by user
exports.showByUser = function(req, res) {
  ClientRequest.find({idUser: req.user._id}, '-__v', {
    sort:{
      createdAt: -1 //Sort by Date Added DESC
    }
  }, function (err, client_request) {
    if(err) { return handleError(res, err); }
    if(!client_request) { return res.status(404).send('Not Found'); }
    return res.json(client_request);
  });
};

// Get a single client_request
exports.showWithJoin = function(req, res) {

  ClientRequest.findById(req.params.id, function (err, client_request) {
    if(err) { return handleError(res, err); }
    if(!client_request) { return res.status(404).send('Not Found'); }
    //io.emit('client-request new', client_requests);
    //return joinWithUsers (client_requests, res, client_requests.length, []);
    getClienRequest([client_request], false, function(result){
      return res.status(200).json(result);
    })
  });
};

// Creates a new client_request in the DB.
exports.create = function(req, res) {
try{
  //req.body.car = JSON.parse(req.body.car);
}catch(ex){
  console.log(ex);
}
console.log(req.body);
  User.findById(req.body.idUser, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(404).json({message:"This user doesn't exits."});
    async.each(req.body.car, function (item, callback) {
      Product.findById(item.id, function (err, Product) {
       // console.log('Product---->',Product);
        if(!Product){return callback({message:"The product ID "+item.id+" doesn't exits."});};
        if(!err){
          return callback(null, true);
        }else{
          return callback(err);
        }
      });
    }, function (err,result) {
      if(!err) {
        req.body.createdAt = new Date().toISOString();
        ClientRequest.create(req.body, function(err, client_request) {
          if(err) { return handleError(res, err); }
          getClienRequest([client_request], true, function(result){
            //return res.status(200).json(result);
            return res.status(200).json({order:result[0].request._id,date:req.body.createdAt});
          })
          //return joinWithUsers ([client_request], res, 1, []);//res.status(201).json(client_request);//exports.index(req, res);
        });
      }
      else{
        return res.status(404).send(err);
      }
    });
  });
};

// Updates an existing client_request in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  ClientRequest.findById(req.params.id, function (err, client_request) {
    if (err) {
      io.sockets.emit('order-processed', {success:false});
      return handleError(res, err);
    }
    if(!client_request) {
      io.sockets.emit('order-processed', {success:false});
      return res.status(404).send('Not Found');
    }

    client_request.car = req.body.request.car;
    _.merge(client_request, req.body.request);
    if(req.body.update==1){
      client_request.status="processed";

      //req.body.request.idUser  ->user id
      var points = 0;
      _.forEach(req.body.car, function(product, key){
        points += product.loyaltyPoints * client_request.car[key].cantA;
        //console.log('loyaltyPoints==>',product.loyaltyPoints);
        //console.log('cant==>',client_request.car[key].cantA);
      });
      User.findById(req.body.request.idUser, function (err, user) {
       var lvls = utils.getLvls();
        user = utils.setUserLvl(user, points, lvls[user.lvl-1].points);
        user.save(function(err) {
          if (err) {
            io.sockets.emit('order-processed', {success:false});
            return handleError(res, err);
          }
          client_request.save(function (err) {
           if (err) { return handleError(res, err); }
            io.sockets.emit('order-processed', {success:true, index:req.body.index});
           return res.status(200).json(client_request);
           });
        });
        console.log('user==>',user);
        console.log('points==>',points);
        //return res.status(200).json({});
      });
      //console.log('points==>',points);
      //console.log('client_request==>',req.body);
    }else if(req.body.update==0){
      client_request.status="cancelled";
      client_request.save(function (err) {
        if (err) {
          io.sockets.emit('order-processed', {success:false});
          return handleError(res, err);
        }
        io.sockets.emit('order-processed', {success:true, index:req.body.index});
        return res.status(200).json(client_request);
      });
    }

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



var joinWithUsers = function(client_requests,res,stop,result){
  stop--;
  console.log('stop---->',stop);
  User.findById(client_requests[stop].idUser, function (err, user) {

    if (err) return next(err);
    if (!user) {
      if(client_requests.length==1){
        ban=false;
        return res.status(200).json([]);
      }
      console.log('---->');
      // if(stop>0)
      //return joinWithUsers(client_requests, res, stop, result);
    }
    if (user && stop>=0)
      result.push({request:client_requests[stop],user:user.profile,car:[]});

    if(stop==0)
    //||join con un varios registros de una tabla
    //||params:
    //||1: data ,2: respuesta, 3: iteraciones del padre, 4: iteraciones de los id seran utilizados para el join
    //||
    //||ejem: [ { idPadre:1,idHijos:[{id:1}, {id:2}]}, {idPadre:2,idHijos:[{id:1}, {id:2}] } ]
    //||result: [ { Padre:{idPadre:1, idHijos:[{id:1},{id:2}] }, Hijos:[ {id:1, atributos},{id:2, atributos} ] },
    //|| { Padre:{ idPadre:2, idHijos:[{id:1},{id:2}] }, Hijos:[ {id:1, atributos},{id:2, atributos} ] } ]
    {
      if(result.length>0){
        return joinWithProducts(result, res, result.length, result[result.length - 1].request.car.length);
      }else{
        return res.status(200).json([]);
      }
    }
    if(stop>0)
      joinWithUsers(client_requests, res, stop, result);

  });
}

var joinWithProducts = function (r,res,stop,count){
  //var count=r[stop-1].request.car.length;
  Product.findById(r[stop-1].request.car[count-1].id, function (err, product) {
    if (err) return next(err);
    /*if (!product){
     //return res.status(404).send('Not Found');
     count--;
     if(count>0){
     return joinWithProducts(r,res,stop,count);
     }
     }*/
    //console.log('r==>',product);
    r[stop-1].car.push(product);
    count--;
    if(count>0){
      return joinWithProducts(r,res,stop,count);
    }
    if(count==0){
      stop--;
      if (stop==0) { if(ban && io)io.sockets.emit('client-request new', r); ban=false;//console.log('something-->');
        if(r.length==1){
          return res.status(200).json({order:r[0].request._id,date:new Date()});
        }
        return res.status(200).json(r);};
      count = r[stop-1].request.car.length
      return joinWithProducts(r,res,stop,count);
    }

  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
