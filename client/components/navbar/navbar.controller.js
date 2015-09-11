'use strict';

angular.module('restaurantApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $location, Auth) {
    $("#layout").removeAttr( "style" );
      $.AdminLTE.pushMenu.activate("[data-toggle='offcanvas']"); 
      $.AdminLTE.layout.activate();

    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $rootScope.isLogged=false;
      $("#layout").attr( "style","display:none;" );
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });