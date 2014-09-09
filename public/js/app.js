var app = angular.module('sampleApp', ['ngRoute', 'flow', 'appRoutes', 'HomeCtrl', 'BulletinCtrl', 'SettingsCtrl','ProfileCtrl', 'drag']);

app.factory('socket', function(){
  var socket = io.connect('http://localhost:8080');
  return socket;
})
