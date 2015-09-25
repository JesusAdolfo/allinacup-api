'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
autoIncrement = require('mongoose-auto-increment');;
var crypto = require('crypto');
autoIncrement.initialize(mongoose);
var UserSchema = new Schema({
  first_name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  last_name: String,
  loyaltyPoints: {type: Number, default: 0},
  phone_number: String,
  address: String,
  gender: String,
  lvl:{type: Number, default: 1},
  hashedPassword: String,
  provider: String,
  salt: String
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      '_id': this._id,
      'email': this.email,
      'first_name': this.first_name,
      'role': this.role,
      'last_name': this.last_name,
      'loyaltyPoints': this.loyaltyPoints,
      'lvl':this.lvl
    };
  });
UserSchema
  .virtual('profile_app')
  .get(function() {
    return {
      'email': this.email,
      'first_name': this.first_name,
      'last_name': this.last_name,
      'loyaltyPoints': this.loyaltyPoints,
      'lvl':this.lvl,
      'gender':this.gender,
      'address': this.address,
      'phone_number': this.phone_number
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value, last) {
  //last.length>5
  return value && value.length && last.length>1;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();
    if (!validatePresenceOf(this.hashedPassword,this._password))
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};
UserSchema.plugin(autoIncrement.plugin, 'User');
module.exports = mongoose.model('User', UserSchema);
