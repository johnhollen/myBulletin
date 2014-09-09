angular.module('SettingsCtrl', []).controller('SettingsController', function($scope, $http, $modal, $timeout, $window) {

  //$scope.settingsBulletins = [];
  //$scope.sharedBulletins = [];
  $scope.wholeUser = {};

  //Function for hiding the serverResponse div
  $scope.showHideServerResponse = function(){
    $scope.showing = true;
    $timeout(function(){$scope.showing = false}, 2000);
  };


  $http.get('fullLoggedInUser').success(function(data){
    $scope.wholeUser = data.user;
    console.log($scope.wholeUser);
  });

  $scope.linkGoogle = function(){
    $window.location.href = '/connect/google';
  };

  $scope.unLinkGoogle = function(){
    $window.location.href = '/unlink/google';
  }

  //Get the bulletinBoards to display in the settings pane
  $scope.getBulletins = function(){
    $http.get('/bulletins').success(function(data){
      console.log(data);
      $scope.settingsBulletins = data.bulletins;
      $scope.sharedBulletins = data.sharedBulletins;
    });
  };


  //Function for changing the bulletins name
  $scope.openEditBulletinName = function(bulletin){
    //Open the popup
    var modalInstance = $modal.open({
      templateUrl: 'editBulletinDialog.html',
      controller: ModalInstanceCtrl,
    });

    //Get the result from the popup
    modalInstance.result.then(function (newObject) {
       bulletin.title = newObject.title;
       $http.put('/bulletins/'+bulletin._id, bulletin).success(function(data){
         $scope.updateStatus = data.serverResponse;
         $scope.showHideServerResponse();
       });
    });
  };

  //Function for removing the bulletinBoard
  $scope.openRemoveBulletin = function(bulletin){

    var modalInstance;

    if(bulletin.sharedWith.length > 0){
      modalInstance = $modal.open({
        templateUrl : 'areYouSureSharedBulletinPopup.html',
        controller : ModalInstanceCtrl,
      });
    }
    else{
      modalInstance = $modal.open({
        templateUrl: 'areYouSureBulletinPopup.html',
        controller: ModalInstanceCtrl,
      });
    }

    //Get the result from the popup
    modalInstance.result.then(function(){
       $http.delete('/bulletin/'+bulletin._id).success(function(data){
         $scope.updateStatus = data.serverResponse;
         $scope.showHideServerResponse();
       });
       //Ajax call to the server to update the list
       $scope.getBulletins();
    });
  };

  //Share a bulletinBoard
  $scope.shareBulletin = function(bulletin){
    var modalInstance = $modal.open({
      templateUrl : 'sharePopup.html',
      controller : ModalInstanceCtrl,
    });

    modalInstance.result.then(function(newObject){
      console.log("Modal result: ");
      console.log(newObject);

      $http.put('/shareBulletin/'+bulletin._id, newObject).success(function(data){
        console.log(data);
      });
      $scope.getBulletins();
    });
  };

  //Edit the user's local emal
  $scope.openEditEmail = function(){
    var modalInstance = $modal.open({
      templateUrl : 'editEmailDialog.html',
      controller : ModalInstanceCtrl,
    });

    modalInstance.result.then(function(newObject){
      console.log(newObject);
      $http.post('/userEmail', newObject).success(function(data){
        $scope.updateStatus = data.serverResponse;
        $scope.showHideServerResponse();
      });
    });
  };

  //Change the user's password. It is directly sent to the server
  $scope.openEditPassword = function(){
    var modalInstance = $modal.open({
      templateUrl : 'editPasswordDialog.html',
      controller : ModalInstanceCtrl,
    });

    modalInstance.result.then(function(newObject){
      $http.post('/userPassword', newObject).success(function(data){
        $scope.updateStatus = data.serverResponse;
        $scope.showHideServerResponse();
      });
    });
  };

}); //End of SettingsController

//Modalinstance for popup windows.
var ModalInstanceCtrl = function ($scope, $modalInstance, $http) {

  $scope.friendFilter = '';
  $scope.selectedFriends = new Array();
  $scope.checked = false;

  $scope.chooseFriend = function(friend, checked){
    console.log(friend);
    if(checked == false){
      $scope.selectedFriends.push(friend);
      console.log("Friend pushed");
    }
    else if(checked == true){
      $scope.selectedFriends.pop(friend);
      console.log("Friend Popped!");
    }
    console.log($scope.selectedFriends);
  };

  $http.get('/friends').success(function(data){
    $scope.theFriends = data.Friends;
  });

  $scope.ok = function (newObject) {
    $scope.newObject = newObject;
    $modalInstance.close($scope.newObject);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
