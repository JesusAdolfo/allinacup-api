'use strict';

angular.module('restaurantApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {//client\bower_components\admin-lte\pages\examples
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl',
        authenticate: true
      })
      .when('/settings', {
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  });
