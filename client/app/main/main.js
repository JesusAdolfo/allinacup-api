'use strict';

angular.module('restaurantApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        authenticate: true,
        label: 'Home'
      });
  });