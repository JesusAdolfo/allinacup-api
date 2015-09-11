'use strict';

angular.module('restaurantApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'btford.socket-io',
  'ui.bootstrap',
  'datatables', 
  'datatables.bootstrap',
  'ng-breadcrumbs',
  'ngFileUpload',
  'ui.bootstrap.showErrors',
  'ngProgress',
  'oitozero.ngSweetAlert'
])
  .config(function ($routeProvider, $locationProvider, $httpProvider, showErrorsConfigProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
     showErrorsConfigProvider.showSuccess(true);
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  }).controller('appCtrl', function ($rootScope, $scope, $http, Auth, socket, breadcrumbs) {

    //$rootScope.isLogged=false;   
    $scope.breadcrumbs = breadcrumbs;
    $scope.title = '';
    $scope.subTitle = '';
    $scope.actives=[false,false,false];
    $scope.setActive = function(x){      
      try{
        $scope.actives[x]=true;
      }catch(ex){}
      angular.forEach($scope.actives,function(value, key){        
        if(key!=x)$scope.actives[key]=false;
      });
    }
  })
  .run(function ($rootScope ,$location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if(loggedIn){
          $("#layout").removeAttr( "style" );
          $rootScope.isLogged=loggedIn;
        }
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $location.path('/login');
        }
      });
    });
  }).factory('DTLoadingTemplate', dtLoadingTemplate);
  function dtLoadingTemplate() {
      return {
          html: '<div class="sk-folding-cube"><div class="sk-cube1 sk-cube"></div><div class="sk-cube2 sk-cube"></div><div class="sk-cube4 sk-cube"></div><div class="sk-cube3 sk-cube"></div></div>'
      };
  }
  //http://img.desmotivaciones.es/201010/load.jpg
