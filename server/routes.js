/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var auth = require('./auth/auth.service');
var utils = require('./components/utils');

module.exports = function(app) {

  //app.use('api/*',);
  // Insert routes below
  app.use('/api/media', require('./api/media'));
  app.use('/api/client-requests', auth.isAuthenticated(), require('./api/client-request'));
  app.use('/api/products', auth.isAuthenticated(), require('./api/product'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  app.get('/api/loyalty-program', auth.isAuthenticated(), function(req, res) {

    res.status(200).json(utils.getLvls());
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
