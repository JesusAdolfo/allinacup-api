'use strict';

describe('Controller: ClientsRequestCtrl', function () {

  // load the controller's module
  beforeEach(module('restaurantApp'));

  var ClientsRequestCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientsRequestCtrl = $controller('ClientsRequestCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
