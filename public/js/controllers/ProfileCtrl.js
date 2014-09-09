angular.module('ProfileCtrl', ['ui.bootstrap']).controller('ProfileController', function($scope, $http, $timeout, $modal){

  //$scope.user = {};

  $scope.selected = '';
  $scope.theFriends = [];
  //$scope.searchUsers = [];

  $http.get('fullLoggedInUser').success(function(data){
    $scope.wholeUser = data.user;
    console.log($scope.wholeUser);
  });

  $scope.setSelected = function(user){
    $scope.selectedUser = user;
  };

  //Function for hiding the serverResponse div
  $scope.showHideServerResponse = function(){
    $scope.showing = true;
    $timeout(function(){$scope.showing = false}, 2000);
  };

  //Function for hiding the response the user gets when he/she does it wrong
  $scope.showHideErrorResponse = function(){
    $scope.errorShowing = true;
    $timeout(function(){$scope.errorShowing = false}, 2000);
  }

  //Function for adding a friendRequest
  $scope.addFriendRequest = function(user){
      console.log(user);
      $http.post('/FriendRequest', user).success(function(data){
        $scope.updateStatus = data.serverResponse;
        $scope.showHideServerResponse();
        $scope.getFriendRequests();
      });
  };

  //Function for getting the users in the system
  $http.get('/users').success(function(data){
    for(var i = 0; i < data.length; i++){
      $scope.selected[i].id = data.searchUsers[i]._id;
    }
    $scope.searchUsers = data.searchUsers;
  });

  //Function for getting the user's friends, confirmed and not confirmed
  $http.get('/friends').success(function(data){
    $scope.theFriends = data.Friends;
  });


  //Function to find the friendRequests
  $scope.getFriendRequests = function(){
    $http.get('/FriendRequests').success(function(data){
      var outgoingUsers = [];
      var incomingUsers = [];
      for(var i = 0; i < data.incomingFriendRequests.length; i++){
        for(var j = 0; j < $scope.searchUsers.length; j++){
          if(data.incomingFriendRequests[i].fromID == $scope.searchUsers[j]._id){
            incomingUsers[i] = $scope.searchUsers[j];
          }
        }
      }
      for(var i = 0; i < data.pendingFriendRequests.length; i++){
        for(var j = 0; j < $scope.searchUsers.length; j++){
          if(data.pendingFriendRequests[i].toID == $scope.searchUsers[j]._id){
            outgoingUsers[i] = $scope.searchUsers[j];
          }
        }
      }
      $scope.incomingFriendRequests = incomingUsers;
      $scope.pendingFriendRequests = outgoingUsers;
    });
  };

  $scope.acceptFriend = function(request){

    console.log("Accepting Request");

    $http.post('/ConfirmFriendRequest', request).success(function(data){
      //Function for getting the user's friends, confirmed and not confirmed
      $http.get('/friends').success(function(data){
        $scope.theFriends = data.Friends;
        $scope.updateStatus = data.serverResponse;
        $scope.showHideServerResponse();
      });
    });

    $timeout(function(){
      $scope.getFriendRequests();
      $http.get('/friends').success(function(data){
        $scope.theFriends = data.Friends;
      });
    }, 500);
  };

  $scope.cancelFriendRequest = function(request){
    //Send the userID down to the server, could be either to or from id.
    $http.delete('FriendRequests/'+request._id).success(function(data){
      console.log(data);
      $scope.updateStatus = data.serverResponse;
      $scope.showHideServerResponse();
    });
    $scope.getFriendRequests();
  };

  $scope.openShareBulletin = function(friend){
    var theFriend = [];
    theFriend.push(friend);
    var ModalInstance = $modal.open({
      templateUrl : 'sharePopup2.html',
      controller  : ModalInstanceCtrl2,
    });

    ModalInstance.result.then(function(newObject){
      var selectedBulletin = newObject[0];

      $http.put('/shareBulletin/'+selectedBulletin._id, theFriend).success(function(data){
        $scope.updateStatus = data.serverResponse;
        $scope.showHideServerResponse();
      });
    });
  };

  $scope.openUnfriend = function(friend){
    var ModalInstance = $modal.open({
      templateUrl : 'areYouSureUnfriendPopup.html',
      controller : ModalInstanceCtrl2,
    });

    ModalInstance.result.then(function(){
      console.log(friend);
      $http.delete('friend/'+friend._id).success(function(data){
        console.log(data);
      });
    });
  };

  //Get the user's statistics
  $http.get('/stats').success(function(data){
    $scope.nrBulletins = data.nrBulletinBoards;
    $scope.nrImages = data.nrImages;
    $scope.nrStickies = data.nrStickies;
    $scope.nrYoutubes = data.nrYoutubes;
  });
}); // End of profile controller


var ModalInstanceCtrl2 = function ($scope, $modalInstance, $http, $timeout) {

  $scope.selectedBulletins = new Array();
  $scope.checked = false;

  $http.get('/bulletins').success(function(data){
    $timeout(function(){
      $scope.theBulletins = data.bulletins;
    }, 50);
  });

  $scope.chooseFriend = function(bulletin, checked){
    console.log(bulletin);
    if(checked == false){
      $scope.selectedBulletins.push(bulletin);
      console.log("Bulletin pushed");
    }
    else if(checked == true){
      $scope.selectedBulletins.pop(bulletin);
      console.log("Bulletin Popped!");
    }
    console.log($scope.selectedBulletins);
  };

  $scope.ok = function (newObject) {
    $scope.newObject = newObject;
    $modalInstance.close($scope.newObject);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
