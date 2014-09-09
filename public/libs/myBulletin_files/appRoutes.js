angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider','$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {

	$routeProvider
		// home page
		

		.when('/home', {
			templateUrl: 'views/loggedin.html',
			controller: 'HomeController',

		});
	$locationProvider.html5Mode(true);
}]);
