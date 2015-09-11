'use strict';

angular.module('restaurantApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/users', {
        templateUrl: 'app/users/users.html',
        controller: 'UsersCtrl',
        label: 'users'
      })
       .when('/users/new', {
        templateUrl: 'app/users/user-management.html',
        controller: 'NewUsersCtrl',
        label: 'New user'
      })
        .when('/users/update/:idUser', {
        templateUrl: 'app/users/user-management.html',
        controller: 'UpdateUsersCtrl',
        label: 'Update user'
      });
  });
angular.module('restaurantApp')
.directive('passwordMatch', [function () {
    return {
        restrict: 'A',
        scope:true,
        require: 'ngModel',
        link: function (scope, elem , attrs,control) {
            var checker = function () { 
                //get the value of the first password
                var e1 = scope.$eval(attrs.ngModel); 
 
                //get the value of the other password  
                var e2 = scope.$eval(attrs.passwordMatch);
                return e1 == e2;
            };
            scope.$watch(checker, function (n) { 
                //set the form control to valid if both 
                //passwords are the same, else invalid
                control.$setValidity("unique", n);
            });
        }
    };
}]);