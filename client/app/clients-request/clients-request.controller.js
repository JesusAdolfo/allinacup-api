'use strict';

angular.module('restaurantApp')
  .controller('ClientsRequestCtrl', function ($scope, $resource, DTOptionsBuilder, DTColumnBuilder, $compile, User, socket	) {
    $scope.$parent.title = 'Requests';
    $scope.$parent.subTitle = 'all';
    $scope.$parent.setActive(2);
    $scope.dtInstance={};
   

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
        return $resource('api/client-requests').query().$promise;
        //return User.query().$promise;
    })
    .withPaginationType('full_numbers')
    .withBootstrap()
    .withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('user.name').withTitle('User'),        
        DTColumnBuilder.newColumn('request.status').withTitle('Status'),
        DTColumnBuilder.newColumn('request.createdAt').withTitle('Date requested'),
        DTColumnBuilder.newColumn('car.length').withTitle('Productos'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable()
           .renderWith(actionsHtml)
       // DTColumnBuilder.newColumn('lastName').withTitle('Last name').notVisible()
    ];
     function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
    function actionsHtml(data, type, full, meta) {
        return '<button class="btn btn-info" ng-click=\'details(' + JSON.stringify(data) + ')\'><i class="fa fa-eye"></i></button>&nbsp;'+
        '<button class="btn btn-warning" ng-click=\'edit(' + JSON.stringify(data) + ')\'><i class="fa fa-edit"></i></button>&nbsp;'+
        '<button class="btn btn-success" ng-click=\'process(' + JSON.stringify(data) + ')\'><i class="fa fa-check"></i></button>&nbsp;'+
        '<button class="btn btn-danger" ng-click=\'delete(' + JSON.stringify(data) + ')\'><i class="fa fa-trash-o"></i></button>&nbsp;';
    }
    $scope.edit = function(id){
    	console.log(id);
 		//$location.path('/users/update/'+id);
    };
    socket.socket.on('client-request:save',function(data){
      console.log('response request',data);
    });
  });
