'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var nodemailer = require('nodemailer');
var generatePassword = require('password-generator');

var validationError = function(res, err) {
  //var er = ""+err;
  //er.replace("[","").replace("]","")
  return res.status(409).json({error:err})
};

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'noreply.allinacup@gmail.com',
    pass: 'AllInACupKorea2015**'
  }
});

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

exports.getUserPoints = function(req, res) {
  User.findOne({email:req.query.username}, function (err, user) {
    if(err) return res.status(500).send(err);
    if(!user) return res.status(404).send('NOT_FOUND');
    console.log(user.chatProfile);
    return res.status(200).json(user.chatProfile);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  //console.log(req.body);
  newUser.provider = 'local';
  //newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    //var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    //res.json({ token: token });
    res.json(user);
  });
};
/**
 * Creates a new costumer
 */
exports.createCostumer = function (req, res, next) {
  var newUser = new User(req.body);
  console.log("creating a new user",req.body);
  newUser.provider = 'local';
  newUser.role = 'costumer';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    //var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    //res.json({ token: token });
    res.status(201).json(user.profile_app);
  });
};
// Updates an existing user in the DB.
exports.update = function(req, res) {

  if(req.body._id) { delete req.body._id; }
  User.findById(req.params.id, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
      _.merge(user, req.body);
     user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');

    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      // NB! No need to recreate the transporter object. You can use
      // the same transporter object for all e-mails

      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: 'nonreply <noreply.allinacup@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Noreply password change', // Subject line
        text: 'Change password', // plaintext body
        //html: '<b>New password: '+generatePassword(10, false)+' </b>' // html body
        html:'<p> Hi '+user.firstName+' '+user.lastName+', </p>'+
        '</br> </br>'+
        '<p>You have requested to change your password.</p></br>'+
        '<p>your new password is: <b>'+user.password+'</p> </b>'+
        '</br> </br>'+
        '<p>Sincerely All in a cup staff. </p>'
      };
      user.save(function(err) {
        if (err) return validationError(res, err);
        transporter.sendMail(mailOptions, function(error, info){
          //if(error) return res.status(403).json({error:error});

          return res.status(201).json({success:true});
        });

      });
    } else {
      return res.status(403).json({error:'Forbidden'});
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {


  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};
/**
 * send mail
 */
exports.sendMail = function (req, res, next) {

  User.findOne({email:req.body.email}, '-salt -hashedPassword', function (err, user) {
    //user = user[0];
    if(err) return res.status(500).send(err);
    if(!user) return res.status(404).send("not found");
    user.password = generatePassword(8, false);

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: 'nonreply <noreply.allinacup@gmail.com>', // sender address
      to: 'ffchris1@gmail.com, denebchorny@gmail.com,'+user.email, // list of receivers
      subject: 'Noreply password recovery', // Subject line
      text: 'Change password', // plaintext body
      //html: '<b>New password: '+generatePassword(10, false)+' </b>' // html body
      html:'<p> Hi '+user.firstName+' '+user.lastName+', </p>'+
      '</br> </br>'+
      '<p>You have requested to recover your password.</p></br>'+
      '<p>your new password is: <b>'+user.password+'</p> </b>'+
      '</br> </br>'+
      '<p>Sincerely All in a cup staff. </p>'
    };
    user.save(function(err) {
      if (err) return validationError(res, err);
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
        //if(error) return res.status(403).json({error:error});

        return res.status(201).json({success:true});
      });
    });

  });

 /* User.findById(req.user._id, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }
    user.password = req.user.password;
    user.save(function(err) {
      if (err) return validationError(res, err);
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
        if(error){
          return console.log(error);
          res.status(403).send(error);
        }
        res.status(201).send('Message sent: ' + info.response);
        console.log('Message sent: ' + info.response);

      });
    });
    });*/
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
