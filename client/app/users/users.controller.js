'use strict';

angular.module('restaurantApp')
  .controller('UsersCtrl', function ($location, $scope, ngProgressFactory, DTOptionsBuilder, DTColumnBuilder, $compile, SweetAlert, User) {
    $scope.$parent.title = 'Users';
    $scope.$parent.subTitle = 'all';
    $scope.$parent.setActive(0);
    $scope.progressbar = ngProgressFactory.createInstance();
	$scope.dtInstance={};

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
        //return $resource('https://l-lin.github.io/angular-datatables/data.json').query().$promise;
        return User.query().$promise;
    })
    .withPaginationType('full_numbers')
    .withBootstrap()
    .withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID'),        
        DTColumnBuilder.newColumn('email').withTitle('Username'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable()
            .renderWith(actionsHtml)
       // DTColumnBuilder.newColumn('lastName').withTitle('Last name').notVisible()
    ];
     function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
    function actionsHtml(data, type, full, meta) {
        return '<button class="btn btn-warning" ng-click="edit(' + data._id + ')">' +
            '   <i class="fa fa-edit"></i>' +
            '</button>&nbsp;' +
            '<button class="btn btn-danger" ng-click="delete(' + data._id + ')">' +
            '   <i class="fa fa-trash-o"></i>' +
            '</button>';
    }

    $scope.edit = function(id){
 		$location.path('/users/update/'+id);
    };
    $scope.delete = function (id){
        SweetAlert.swal({
        title: "Are you sure?",
           text: "This user will be delete",
           type: "warning",
           showCancelButton: true,
           confirmButtonColor: "#DD6B55",
           confirmButtonText: "Yes, delete it!",
           closeOnConfirm: false}, 
        function(){ 
            $scope.progressbar.start();
           User.remove({ id: id }).$promise.then(function(data) {
                // success
                SweetAlert.swal("Good job!", "User has been deleted", "success");
            }, function(errResponse) {
                // fail
                SweetAlert.swal("Alert!", errResponse.data, "error");
            }).finally(function(){
                // // fail  
                $scope.dtInstance.reloadData();
                $scope.progressbar.stop();       
            });
        });        
    };
    
}).controller('NewUsersCtrl', function ($scope, $location, ngProgressFactory, SweetAlert, User) {
 	$scope.$parent.title = 'User';
    $scope.$parent.subTitle = 'New';
    $scope.$parent.setActive(0);
    $scope.user = {};
    $scope.progressbar = ngProgressFactory.createInstance();


    $scope.save = function(){
    	$scope.$broadcast('show-errors-check-validity');
    	if($scope.userForm.$valid){
    		$scope.progressbar.start();
    		$scope.user.role='user';
    		User.save($scope.user).$promise.then(function(data) {
                // success
                SweetAlert.swal("Good job!", "Product has been deleted", "success");
                $location.path('/users');
            }, function(errResponse) {
                // fail
                console.log(errResponse)
                SweetAlert.swal("Alert!", errResponse.data, "error");
            }).finally(function(){
                // // fail  
                $scope.progressbar.stop();       
            });
    	}
    }
 }).controller('UpdateUsersCtrl', function ($scope, $location, $routeParams, ngProgressFactory, SweetAlert, User) {
    $scope.$parent.title = 'User #'+$routeParams.idUser;
    $scope.$parent.subTitle = 'update';
    $scope.$parent.setActive(0);
    $scope.user = {};
    $scope.progressbar = ngProgressFactory.createInstance();

    $scope.progressbar.start();
    User.get({ id: $routeParams.idUser }).$promise.then(function(data) {
       // success
       $scope.user = data; 
    }, function(errResponse) {
       // fail
       SweetAlert.swal("Alert!", errResponse.error, "error");
        $location.path('/users');
    }).finally(function(){
        // // fail  
        $scope.progressbar.stop();       
    });

    $scope.save = function(){
        $scope.$broadcast('show-errors-check-validity');
        if($scope.userForm.$valid){
            $scope.progressbar.start();
            $scope.user.role='user';
            User.update({id:$routeParams.idUser},$scope.user).$promise.then(function(data) {
                // success
                SweetAlert.swal("Good job!", "Product has been deleted", "success");
                $location.path('/users');
            }, function(errResponse) {
                // fail
                SweetAlert.swal("Alert!", "There was a problem", "error");
            }).finally(function(){
                // // fail  
                $scope.progressbar.stop();       
            });
        }
    }
 });
