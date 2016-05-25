'use strict';

angular.module('restaurantApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $rootScope) {
    $scope.user = {};
    $scope.errors = {};
    $scope.submitted = {};
    $scope.$apply;
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
          $rootScope.isLogged = true;
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
