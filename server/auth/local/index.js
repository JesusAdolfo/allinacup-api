'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var request = require("request");
var User = require('../../api/user/user.model');
var router = express.Router();
var auth = require('../../auth/auth.service');

router.post('/', function(req, res, next) {
  console.log('pase por aqui');
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
    if(user.role=="costumer") return res.status(401).json({message: 'You aren´t authorized.'});
    var token = auth.signToken(user._id, user.role);
    res.json({token: token});

  })(req, res, next)
});
router.post('/app', function(req, res, next) {
  console.log('pase por aqui');
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});

  })(req, res, next)
});
router.post('/fb', function(req, res, next) {
  //console.log('body==>',req.body);
  request({
    uri: "https://graph.facebook.com/me?fields=email,first_name,last_name,gender&access_token="+req.body.facebook_token,
    method: "GET",
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10
  }, function(error, response, body) {
    body = JSON.parse(body);

    if(error){
      res.status(400).json({"success":false,"error":"internal error"});
    }else{

      User.find({email:body.email}, function (err, user) {
        user = user[0];
        if (err) return next(err);
        if (user){
          console.log('user',user);
          //res.json({});
         /*var newUser = new User({
            email:body.email,
            password:"",
            name:body.first_name,
            lastName:body.last_name,
            loyaltyPoints:0,
            lvl:1,
            phone:"",
          });
          //console.log(req.body);
          newUser.provider = 'local';
          newUser.role = 'customer';
          newUser.save(function(err, user) {
            if (err) return validationError(res, err);
            var token = "ASDersdf==?SFdfdf[SDF+f";//jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
            user.token=token;
            res.json({user:user});
            //res.json(user);
          });*/
          //var token = "ASDersdf==?SFdfdf[SDF+f";
          var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
          var result = user.profile_app;
          result.token=token;
          res.json(result);
        }else{
          //body.token=null;
          var user = {
            email:body.email,
            firstName:body.first_name,
            gender:body.gender,
            lastName:body.last_name,
            token:null
          }
          console.log('body',user);
          res.status(201).json(user);
        }
      });
      //res.status(201).json({'success':true});
    }
  });

});

module.exports = router;
