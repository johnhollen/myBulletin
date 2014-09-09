angular.module('BulletinCtrl', ['ui.bootstrap']).controller('BulletinController', function($scope, $http, $modal, $timeout, socket) {

  //Controller for the bulletinBoard
  $scope.loggedInBulletins = [];
  $scope.loggedInUser = {};
  $scope.sharedBulletins = [];
  $scope.joinedBulletins = [];
  $scope.activeBulletin = {};
  $scope.updateStatus = {};
  $scope.activeBulletin.title = "No bulletin Selected!";
  $scope.files = [];

  $http.get('/fullLoggedInUser').success(function(data){
    $scope.loggedInUser = data.user;
  });

  //Function for hiding the serverResponse div
  $scope.showHideServerResponse = function(){
    $scope.showing = true;
    $timeout(function(){$scope.showing = false}, 2000);
  };

  $scope.showHideUserConnect = function(){
    $scope.userShowing = true;
    $timeout(function(){$scope.userShowing = false}, 2000);
  };

  //Function for hiding the response the user gets when he/she does it wrong
  $scope.showHideErrorResponse = function(){
    $scope.errorShowing = true;
    $timeout(function(){$scope.errorShowing = false}, 2000);
  }

  //Function for opening the dialog box with the inputfield.
  $scope.openCreateDialog = function () {

    var modalInstance = $modal.open({
      templateUrl: 'createBulletinDialog.html',
      controller: ModalInstanceCtrl,

    });

   modalInstance.result.then(function (newObject) {
      $http.post('/bulletins', newObject).success(function(data){
        $scope.updateStatus = data.serverResponse;
        $scope.showHideServerResponse();
      });

      $scope.getBulletins();
    }, function () {
    });
  };

  //Get the logged in user's bulletinBoards
  $scope.getBulletins = function(){
    $http.get('/bulletins').success(function(data){
      $scope.loggedInBulletins = data.bulletins;
      $scope.sharedBulletins = data.sharedBulletins;
    });

    $http.get('joinedBulletins').success(function(data){
      $scope.joinedBulletins = data.joinedBulletins;
    });


  };

  //Function for selecting which bulletinBoard to be active
  $scope.setActive = function(bulletin){
      $scope.activeBulletin.isActive = false;
      bulletin.isActive = true;
      $scope.activeBulletin = bulletin;

    //Get the logged in Users contents corresponding to the active bulletinBoard
    //Do the ajax call here to refresh the site!
    $http.get('/stickies/'+$scope.activeBulletin._id).success(function(data){
      $scope.theStickies = data;
    });
    //Get the youtubeclips
    $http.get('/youtubes/'+$scope.activeBulletin._id).success(function(data){
      $scope.theYoutubes = data;
    });
    //Get the images
    $http.get('/images/'+$scope.activeBulletin._id).success(function(data){
      $scope.theImages = data;
    });

    socket.emit('joinRoom', $scope.activeBulletin._id);

    if($scope.activeBulletin.sharedWith.length > 0){
      socket.emit('userJoined', $scope.loggedInUser);
    }
  };

  socket.on('newUser', function(data){
    $timeout(function(){
      if(data.hasOwnProperty('google')){
        $scope.updateStatus = data['google'].name;
        $scope.showHideUserConnect();
      }
      else{
        $scope.updateStatus = data['local'].email;
        $scope.showHideUserConnect();
      }
    }, 500);
  });

  //Function for creating a new StickyNote
  $scope.openCreateStickyDialog = function(){
    if($scope.activeBulletin.title !== "No bulletin Selected!"){

      var modalInstance = $modal.open({
        templateUrl: 'createStickyDialog.html',
        controller: ModalInstanceCtrl,
      });

      modalInstance.result.then(function (newObject) {
         newObject.activeBulletin = $scope.activeBulletin;

         $http.post('/stickies', newObject).success(function(data){
           $scope.updateStatus = data.serverResponse;
           $scope.showHideServerResponse();
         });

         //Update the view
         $http.get('/stickies/'+$scope.activeBulletin._id).success(function(data){
           $scope.theStickies = data;
         });
       }, function () {
       });
    }
    else{
      $scope.updateStatus = "Select a bulletinBoard!";
      $scope.showHideErrorResponse();
    }
  };

  //Function for removing stickyNotes
  $scope.removeSticky = function(sticky){
    $http.delete('/sticky/'+sticky._id).success(function(data){
      $scope.updateStatus = data.serverResponse;
      $scope.showHideServerResponse();
    });
    $http.get('/stickies/'+$scope.activeBulletin._id).success(function(data){
      $scope.theStickies = data;
    });
  };

  $scope.removeYoutube = function(youtube){
    $http.delete('youtube/'+youtube._id).success(function(data){
      $scope.updateStatus = data.serverResponse;
      $scope.showHideServerResponse();
  });

    //Update the view
    $http.get('/youtubes/'+$scope.activeBulletin._id).success(function(data){
      $scope.theYoutubes = data;
    });
  };


  //Function for updating the draggable objects coordinates
  $scope.updateObjectCoords = function(object){
    $http.post('/updateObjectCoords', object).success(function(data){
      $scope.updateStatus = data.serverResponse;
      $scope.showHideServerResponse();
    });
    socket.emit('updateCoords', object);
  };

  socket.on('getNewCoords', function(theData){
    $http.get('/stickies/'+$scope.activeBulletin._id).success(function(data){
      $scope.theStickies = data;
    });
    $http.get('/youtubes/'+$scope.activeBulletin._id).success(function(data){
      $scope.theYoutubes = data;
    });
    $http.get('/images/'+$scope.activeBulletin._id).success(function(data){
      $scope.theImages = data;
    });
  });

  //Open the dialog for youtube Videos
  $scope.openCreateYoutube = function(){
    if($scope.activeBulletin.title !== "No bulletin Selected!"){
    var modalInstance = $modal.open({
      templateUrl: 'createYoutubeDialog.html',
      controller: ModalInstanceCtrl,
    });

    modalInstance.result.then(function (newObject) {
       newObject.activeBulletin = $scope.activeBulletin;

       //Todo, parse the url to pick out the videoID.
       var url = newObject.url;
       var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
       if(videoid != null) {
           newObject.videoID = videoid[1];

           //Send the new object to the server
           $http.post('/youtubes', newObject).success(function(data){
             $scope.updateStatus = data.serverResponse;
             $scope.showHideServerResponse();
           });

           //Update the view.
           $http.get('/youtubes/'+$scope.activeBulletin._id).success(function(data){
             $scope.theYoutubes = data;
           });
       }
       else
       {
          $scope.updateStatus = "Invalid Youtube-Url!";
          $scope.showHideErrorResponse();
       }
     });
   }
   else{
     $scope.updateStatus = "Select a bulletinBoard!";
     $scope.showHideErrorResponse();
   }
  };

  //Upload an image
  $scope.uploadImage = function(){
    if($scope.activeBulletin.title !== "No bulletin Selected!"){
      var modalInstance = $modal.open({
        templateUrl: 'uploadImageDialog.html',
        controller: ModalInstanceCtrl,

      });

      modalInstance.result.then(function(newObject){
        $scope.files=newObject;
        $scope.saveImage();
        //Update the view, doesn't asyncronous fault?
        $timeout(function(){
          $http.get('/images/'+$scope.activeBulletin._id).success(function(data){
            $scope.theImages = data;

          });
        }, 1500);
      });
    }
    else{
      $scope.updateStatus = "Select a bulletinBoard!";
      $scope.showHideErrorResponse();
    }
  };

  $scope.saveImage = function() {
    $http({
      method: 'POST',
      url: "/imageUpload",
      headers: { 'Content-type': undefined },

      transformRequest: function (data) {
        var formData = new FormData();
        formData.append("bulletin", (data.bulletin));
        //now add all of the assigned files
        formData.append("image", data.image);
        return formData;
      },
      data: {bulletin: $scope.activeBulletin._id,  image: $scope.files }
    }).
    success(function (data, status, headers, config) {
        $scope.updateStatus = data.serverResponse;
        $scope.showHideServerResponse();
    });
  };

  $scope.removeImage = function(image){

    $http.delete('/image/'+image._id).success(function(data){
      $scope.updateStatus = data.serverResponse;
      $scope.showHideServerResponse();
    });

    $http.get('/images/'+$scope.activeBulletin._id).success(function(data){
      $scope.theImages = data;
    });
  };




    //Function to be able to add the youtube link, some strange special case..
    $scope.getIframeSrc = function (videoId) {
      return 'https://www.youtube.com/embed/' + videoId;
    };

});//End of BulletinController

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance) {

  $scope.newObject = {};

  $scope.ok = function (newObject) {
    $scope.newObject = newObject;
    $modalInstance.close($scope.newObject);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
