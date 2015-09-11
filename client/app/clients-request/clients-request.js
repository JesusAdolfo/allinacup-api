'use strict';

angular.module('restaurantApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/clients-request', {
        templateUrl: 'app/clients-request/clients-request.html',
        controller: 'ClientsRequestCtrl'
      });
  });
