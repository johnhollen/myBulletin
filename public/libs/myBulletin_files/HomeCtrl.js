angular.module('HomeCtrl', []).controller('HomeController', function($scope, $http, $route, $location) {

	//get the logged in user
	$http.get('/loggedInUser').success(function(data){
		$scope.user = data['local'].email;
	});

	$scope.logout = function(data){
		$http.get('/logout').success(function(data){
			console.log(data);
			scope.logout = data;
		};
		});

});
