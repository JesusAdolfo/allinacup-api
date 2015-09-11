'use strict';

angular.module('restaurantApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/products', {
        templateUrl: 'app/products/products.html',
        controller: 'ProductsCtrl',
        authenticate: true,
        label: 'Products'
      }).when('/products/new', {
        templateUrl: 'app/products/product-management.html',
        controller: 'NewProductsCtrl',
        authenticate: true,
        label: 'New Product'
      }).when('/products/update/:idProduct', {
        templateUrl: 'app/products/product-management.html',
        controller: 'UpdateProductsCtrl',
        authenticate: true,
        label: 'Update Product'
      });
  });

  angular.module('restaurantApp')
  .factory('Products', function ($resource) {
    return $resource('/api/products/:id', {
      id: '@_id'
    });
  });

