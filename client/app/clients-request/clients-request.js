'use strict';

angular.module('restaurantApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/clients-request', {
        templateUrl: 'app/clients-request/clients-request.html',
        controller: 'ClientsRequestCtrl'
      });
  });

angular.module('restaurantApp')
  .factory('Request', function ($resource) {
    return $resource('api/client-requests/:id', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT'
      }
    });
  }).filter('total', function () {
    return function (item, key) {
      var sum = 0;
      angular.forEach(item.car, function (x, key) {
        if(item.request.car[key].cantA==undefined)
          item.request.car[key].cantA = parseInt(item.request.car[key].cant);
        sum += x.price*parseInt(item.request.car[key].cantA);
      });
      return sum;
     /* if (typeof (data) === 'undefined' || typeof (key) === 'undefined') {
        return 0;
      }

      var sum = 0;
      for (var i = data.length - 1; i >= 0; i--) {
        sum += parseInt(data[i][key]);
      }

      return sum;*/
    };
  }).filter('itemTotal', function () {
    return function (price,cant) {
     return price*cant;
    };
  });
