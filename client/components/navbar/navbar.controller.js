'use strict';

angular.module('restaurantApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $location, Auth, $timeout, $compile, User) {
    $("#layout").removeAttr( "style" );

    $.AdminLTE.pushMenu.activate("[data-toggle='offcanvas']");
    $.AdminLTE.layout.fix();
    var o = $.AdminLTE.options;
    $compile($('nav'))($scope);

    $timeout(function(){
      $(".navbar .menu").slimscroll({
        height: o.navbarMenuHeight,
        alwaysVisible: false,
        size: o.navbarMenuSlimscrollWidth
      }).css("width", "100%");
      $scope.$apply;
      //$compile($('nav'))($scope);
     },100);

    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.user = User.get();;
    console.log($scope.user);
    $scope.p="dsadas";
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
