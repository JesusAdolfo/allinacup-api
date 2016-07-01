'use strict';

var express = require('express');
var controller = require('./product.controller');
var multipart = require('connect-multiparty');
var utils = require('./../../components/utils/index.js');
var path = "./server/tmp";
utils.createPath(path);
var multipartMiddleware = multipart({ uploadDir: path });

var router = express.Router();

router.get('/', controller.index);
router.get('/getTypes', controller.getTypes);
router.get('/:id', controller.show);
//router.get('/byType/:type', controller.findByType);
router.post('/', multipartMiddleware, controller.create);
router.put('/add-order-field', controller.addField);
router.put('/:id', multipartMiddleware, controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
