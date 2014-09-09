angular.module('appRoutes', []).config(['$sceDelegateProvider', '$routeProvider', '$locationProvider','$httpProvider', function($sceDelegateProvider, $routeProvider, $locationProvider, $httpProvider) {

	$routeProvider
		// home page
		.when('/home', {
			templateUrl: 'views/loggedin.html',
		})
		.when('/settings', {
			templateUrl: 'views/settings.html',
		})
		.when('/profile', {
			templateUrl: 'views/profile.html',
		});
	$locationProvider.html5Mode(true);

	$sceDelegateProvider.resourceUrlWhitelist([
  'self',
  'https://www.youtube.com/**']);


}]);
