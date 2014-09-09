angular.module('HomeCtrl', []).controller('HomeController', function($scope, $http, $window) {

	//get the logged in user
	$http.get('/fullLoggedInUser').success(function(data){
			$scope.user = data.user;		
	});

	$scope.logout = function(){
		$http.get('/logout').success(function(data){
			$window.location.href = '/';
		});
	};
});
