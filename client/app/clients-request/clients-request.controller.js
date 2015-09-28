'use strict';

angular.module('restaurantApp')
  .controller('ClientsRequestCtrl', function ($scope, $resource, DTOptionsBuilder, DTColumnBuilder, $compile, Request, socket,notify	) {
    $scope.$parent.title = 'Requests';
    $scope.$parent.subTitle = 'all';
    $scope.$parent.setActive(2);
    $scope.dtInstance={};
    $scope.requests = [];
    $scope.visibility = {show:[]};
    $scope.template = '';
    $scope.classes = 'alert-success';
    position: $scope.position = 'center';

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


    Request.query().$promise.then(function(response){

      //socket.unsyncNewOrders();
      angular.forEach(response,function(item){
        $scope.visibility.show.push(true);
      });
      $scope.requests = response;
      socket.getNewOrders(function(x){
        console.log('===>');
        $scope.requests.push(x[0]);
        $scope.visibility.show.push(true);
      });

    });

    $scope.process = function(order,index,type){
      //console.log('Done',order);
      /*car: Array[4]
       createdAt: "15/9/2015 10:02 PM"
       idUser: "1"
       status: "requested"*/
      //var send = {car:order.car, idUser:order.idUser, status:'requested', createdAt:order.createdAt};
      //console.log('send',send);

      order.update = type;
      Request.update({id:order.request._id},order).$promise.then(function(response){
        console.log('Done',response);
        //$scope.visibility[index]=false;
        $scope.visibility.show[index]=false;
       // $scope.requests.splice(index,1);
      });
    }

    /*socket.socket.on('client-request new',function(data){
      console.log('response request',data);
      //socket.socket.removeAllListeners('client-request new');
    });*/
    //socket.syncUpdates('client-request', $scope.awesomeThings);
  });
