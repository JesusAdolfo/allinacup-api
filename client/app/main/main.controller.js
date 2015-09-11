'use strict';

angular.module('restaurantApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.$parent.title = '';
    $scope.$parent.subTitle = '';
    $scope.$parent.setActive(-1);
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });
    /*socket.socket.on('thing:save' || 'thing:remove',function(data){
      $scope.awesomeThings.push(data);
      console.log('response main',data);
    });*/
    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
