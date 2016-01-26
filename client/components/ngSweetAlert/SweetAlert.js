/**
@fileOverview

@toc

*/

'use strict';

angular.module('oitozero.ngSweetAlert', [])
.factory('SweetAlert', [ '$rootScope', function ( $rootScope ) {

	var swal = window.swal;

	//public methods
	var self = {

		swal: function ( arg1, arg2, arg3 ) {
			$rootScope.$evalAsync(function(){
				if( typeof(arg2) === 'function' ) {
					swal( arg1, function(isConfirm){
						$rootScope.$evalAsync( function(){
							arg2(isConfirm);
						});
					}, arg3 );
				} else {
					swal( arg1, arg2, arg3 );
				}
        // remove these events;
        window.onkeydown = null;
        window.onfocus = null;
			});
		},
		success: function(title, message) {
			$rootScope.$evalAsync(function(){
				swal( title, message, 'success' );
        // remove these events;
        window.onkeydown = null;
        window.onfocus = null;
			});
		},
		error: function(title, message) {
			$rootScope.$evalAsync(function(){
				swal( title, message, 'error' );
        // remove these events;
        window.onkeydown = null;
        window.onfocus = null;
			});
		},
		warning: function(title, message) {
			$rootScope.$evalAsync(function(){
				swal( title, message, 'warning' );
        // remove these events;
        window.onkeydown = null;
        window.onfocus = null;
			});
		},
		info: function(title, message) {
			$rootScope.$evalAsync(function(){
				swal( title, message, 'info' );
        // remove these events;
        window.onkeydown = null;
        window.onfocus = null;
			});
		}
	};

	return self;
}]);
