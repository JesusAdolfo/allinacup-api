'use strict';

angular.module('restaurantApp')
  .controller('SideBarCtrl', function ($scope, $location, Auth,$timeout) {

   //$.AdminLTE.pushMenu.activate("[data-toggle='offcanvas']");
   $scope.isAdmin = Auth.isAdmin;

    $timeout(function () {
      $.AdminLTE.tree('.sidebar');
    },200)
  });
