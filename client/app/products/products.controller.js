'use strict';

angular.module('restaurantApp')
  .controller('ProductsCtrl', function ($resource, $location, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, SweetAlert, Products) {
    $scope.$parent.title = 'Products';
    $scope.$parent.subTitle = 'all';
    $scope.$parent.setActive(1);
	$scope.dtInstance={};
    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
        //return $resource('https://l-lin.github.io/angular-datatables/data.json').query().$promise;
        return $resource('/api/products').query().$promise;
    })
    .withPaginationType('full_numbers')
    .withBootstrap()
    .withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('_id').withTitle('ID'),
        DTColumnBuilder.newColumn('name').withTitle('Name'),
        DTColumnBuilder.newColumn('loyaltyPoints').withTitle('Loyalty points'),
        DTColumnBuilder.newColumn('price').withTitle('Price $'),
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
 		//$scope.dtInstance.reloadData();
 		$location.path('/products/update/'+id);
    };
    $scope.delete = function (id){
        SweetAlert.swal({
        title: "Are you sure?",
           text: "This product will be delete",
           type: "warning",
           showCancelButton: true,
           confirmButtonColor: "#DD6B55",
           confirmButtonText: "Yes, delete it!",
           closeOnConfirm: false},
        function(){
           Products.remove({ id: id }).$promise.then(function(data) {
                // success
                SweetAlert.swal("Good job!", "Product has been deleted", "success");
            }, function(errResponse) {
                // fail
            }).finally(function(){
                // // fail
                $scope.dtInstance.reloadData();
                $scope.progressbar.stop();
            });
        });
    };

  })
 .controller('NewProductsCtrl', function ($scope, $location, Upload, ngProgressFactory, SweetAlert) {
 	$scope.$parent.title = 'Products';
    $scope.$parent.subTitle = 'New';
    $scope.$parent.setActive(1);
    $scope.product = {};
    $scope.progressbar = ngProgressFactory.createInstance();

    $scope.product.type="FOOD";
    $scope.save = function(){
    	$scope.$broadcast('show-errors-check-validity');
    	if($scope.podructForm.$valid){
    		//console.log('ok',$scope.product.file);
    		Upload.upload({
	            url: 'api/products',
	            fields: $scope.product,
	            file: $scope.product.file,
                method:"POST"
	        }).progress(function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	            $scope.progressbar.set(progressPercentage);
	            //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
	        }).success(function (data, status, headers, config) {
	            //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
	            SweetAlert.swal("Good job!", "Product has been added", "success");
	            $location.path('/products');
	        }).error(function (data, status, headers, config) {
	            console.log('error status: ' + status);
	            SweetAlert.swal("Warning", "Looks like there was a problem", "error");
	        }).finally(function (data, status, headers, config) {
	            $scope.progressbar.complete();
	        });
    	}
    }
 })
  .controller('UpdateProductsCtrl', function ($scope, $routeParams, $location, Upload, ngProgressFactory, SweetAlert, Products) {
 	$scope.$parent.title = 'Product #'+$routeParams.idProduct;
    $scope.$parent.subTitle = 'Edit';
    $scope.$parent.setActive(1);
    $scope.product = {};
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.progressbar.start();
    /*Products.get({ id: $routeParams.idProduct }, function success(data, getResponseHeaders){
        $scope.product = data;
  	},function error(err){
        console.log('salida u==>',err);
    },function last(){
        console.log('finally==>');
        $scope.progressbar.stop();
    });*/
    Products.get({ id: $routeParams.idProduct }).$promise.then(function(data) {
       // success
       $scope.product = data;
    }, function(errResponse) {
       // fail
    }).finally(function(){
        // // fail
        $scope.progressbar.stop();
    });
     $scope.save = function(){
        $scope.$broadcast('show-errors-check-validity');
        if($scope.podructForm.$valid){
            console.log('ok',$scope.product);
            Upload.upload({
                url: 'api/products/'+$routeParams.idProduct,
                fields: $scope.product,
                file: $scope.product.file,
                method:"PUT"
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.progressbar.set(progressPercentage);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                SweetAlert.swal("Good job!", "Product has been added", "success");
                $location.path('/products');
            }).error(function (data, status, headers, config) {
                console.log('error status: ' + status);
                SweetAlert.swal("Warning", "Looks like there was a problem", "error");
            }).finally(function (data, status, headers, config) {
                $scope.progressbar.complete();
            });
        }
    }

});
