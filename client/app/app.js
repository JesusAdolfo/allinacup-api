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
  'oitozero.ngSweetAlert',
  'cgNotify',
  'ngAnimate',
  'btford.socket-io'
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
  }).controller('appCtrl', function ($rootScope, $scope, $http, Auth, socket, notify, breadcrumbs, $location) {

    //$rootScope.isLogged=false;
    $rootScope.isLogged = $location.$$path!="/login"
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
    socket.unsyncNewOrders();
    socket.getNewOrders(function(x){

      var messageTemplate = '<span>You have a new order '+x[0].request._id+' <a href="" ng-click=\'clickedLink('+JSON.stringify(x[0].request._id)+')\'>check it out</a>. '+ '</span>';
      if(Auth.isLoggedIn()){
        notify({
          messageTemplate: messageTemplate,
          classes: $scope.classes,
          scope:$scope,
          templateUrl: $scope.template,
          position: $scope.position,
        });
      }

    });
    $scope.clickedLink = function (id){
      console.log('/clients-request#'+id);
      $location.path('/clients-request');
    }
  })
  .run(function ($rootScope ,$location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
       /* if(loggedIn){
          $("#layout").removeAttr( "style" );
          $rootScope.isLogged=loggedIn;
        }
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $location.path('/login');
        }*/
        $rootScope.isLogged = loggedIn;
        if (!loggedIn) {
          //next.authenticate &&
          //event.preventDefault();
          $location.path('/login');
        }else{
          if($location.$$path=="/login")
            $location.path('/');
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
