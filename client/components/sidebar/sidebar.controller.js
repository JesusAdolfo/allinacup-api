'use strict';

angular.module('restaurantApp')
  .controller('SideBarCtrl', function ($scope, $location, Auth) {
   
   //$.AdminLTE.pushMenu.activate("[data-toggle='offcanvas']"); 
   $scope.isAdmin = Auth.isAdmin;
  });