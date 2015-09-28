'use strict';

angular.module('restaurantApp')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};
    $scope.submitted = {};
    $scope.$apply;
    $scope.user.email='admin@admin.com';
    $scope.user.password='admin';
    if(Auth.isLoggedIn){ $location.path('/'); }
    $scope.login = function(form) {
      $scope.submitted.get = true;

      if(form.$valid) {
        //$scope.errors.other =null;
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
