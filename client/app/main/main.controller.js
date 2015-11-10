'use strict';

angular.module('restaurantApp')
  .controller('MainCtrl', function ($scope, $http, socket, User) {
    $scope.$parent.title = '';
    $scope.$parent.subTitle = '';
    $scope.$parent.setActive(-1);
    $scope.awesomeThings = [];
    $scope.user = {};
    User.get().$promise.then(function (response) {

      $scope.user = response;
      socket.chatInit({username:response.email, user:response.firstName, channel:"default"});
      socket.sedMessage({
        user:$scope.user.firstName,
        message:"paso algo vale"
      });
      console.log("paso algo vale");
    });
    socket.notifiNewUser(function (data) {
      console.log('new user connected: ',data);
    });
    socket.receiveMessage(function (data) {
      console.log('new message: %s from : %s',data.message,data.user);
    });
    $scope.kickUser = function () {
     /* socket.kick({
        user:"chris"
      });*/
      socket.kick("chris");
    };
    socket.wasKicked(function (data) {
      console.log(data);
    });
    $scope.sendMessage = function () {
      socket.sedMessage({
        user:$scope.user.firstName,
        message:$scope.message
      });
    };

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
