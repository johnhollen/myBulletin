module.exports = function(app, passport) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.sendfile('./public/index.html'); // load the index.html file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================

	// process the login form
	// app.post('/login', do all our passport stuff here);
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/home', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.sendfile('./public/signup.html', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/home', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// ==================================
	// GOOGLE ===========================
	// ==================================
	// send to google to do the authentication
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback',
		passport.authenticate('google', {
			successRedirect : '/home',
			failureRedirect : '/'
	}));

	//Linking
	app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

	// the callback after google has authorized the user
	app.get('/connect/google/callback',
		passport.authorize('google', {
			successRedirect : '/settings',
			failureRedirect : '/'
	}));

	// Unlinking
	app.get('/unlink/google', function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/home');
		});
	});


	app.get('/home', isLoggedIn, function(req, res) {
		res.sendfile('./public/views/home.html');
	});



	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', isLoggedIn, function(req, res) {
		req.logout();
		res.redirect('/');
	});

	//Get the logged in user
	app.get('/loggedInUser', isLoggedIn, function(req, res){
		//res.json(req.user['local'].email);
		res.json({localEmail : req.user['local'].email, googleName : req.user['google'].name});
	});

	app.get('/fullLoggedInUser', isLoggedIn, function(req, res){
		res.json({user: req.user});
	});

	// =====================================
	// Stats ===============================
	// =====================================
	app.get('/stats', isLoggedIn, function(req, res){
		var nrBulletinBoards;
		var nrStickies;
		var nrYoutubes;
		var nrImages;
		BulletinBoard.find({userID : req.user._id}, function(err, bulletinBoards){
			if(err) throw err;

			nrBulletinBoards = bulletinBoards.length;
			Sticky.find({userID : req.user._id}, function(err, stickies){
				if(err) throw err;

				nrStickies = stickies.length;
				YoutubeVideo.find({userID : req.user._id}, function(err, youtubes){
					if(err) throw err;

					nrYoutubes = youtubes.length;
					ImagePic.find({userID : req.user._id}, function(err, images){
						if(err) throw err;

						nrImages = images.length;
						res.json({nrImages : nrImages, nrBulletinBoards : nrBulletinBoards, nrYoutubes : nrYoutubes, nrStickies : nrStickies});
					});
				});
			});
		});
	});


	// =====================================
	// Routes for bulletinBoard ============
	// =====================================

	var BulletinBoard = require('./models/bulletinBoard');
	var User = require('./models/user');

	//Create a new BulletinBoard
	app.post('/bulletins', isLoggedIn, function(req, res){

		User.update({_id : req.user._id}, { $inc : {
					'stats.nrBulletins' : 1,
				}
			}, false, false);

		new BulletinBoard({
			title	: req.body.text,
			userID : req.user._id,
		}).save(function(err, bulletinBoard, count){
			res.json({serverResponse: "Bulletin Created"});
		});
	});

	//Get the bulletinBoards corresponding to the logged in User.
	app.get('/bulletins', isLoggedIn, function(req, res){
		var sharedBulletins = [];
		var bulletins = [];
		BulletinBoard.find({userID : req.user._id, $where : "this.sharedWith.length > 0"}, function(err, sharedBulletinBoards){
			sharedBulletins = sharedBulletinBoards;

			BulletinBoard.find({userID : req.user._id, sharedWith : { $size : 0}}, function(err, bulletinBoards){
				bulletins = bulletinBoards;
				console.log(sharedBulletinBoards);
				res.json({bulletins : bulletins, sharedBulletins : sharedBulletins});
			});
		});
  });

	//Get the joined bulletinboards
	app.get('/joinedBulletins', isLoggedIn, function(req, res){
		var joinedBulletinIDs = [];
		var joinedBulletins = [];
		if(req.user.sharedBulletins.length > 0){
			joinedBulletinIDs = req.user.sharedBulletins;
			//console.log(joinedBulletinIDs);

			var getJoinedBulletins = function(callback){
				for(var i = 0; i < joinedBulletinIDs.length; i++){
					BulletinBoard.find({_id : joinedBulletinIDs[i].bulletinID}, function(err, bulletinBoard){
						if(!bulletinBoard){
							res.json({joinedBulletins : 'No joined bulletins'});
						}
						joinedBulletins.push(bulletinBoard[0]);
						if(i == joinedBulletins.length){
							callback(joinedBulletins);
						}
					});
				}
			};

			getJoinedBulletins(function(bulletins){
				console.log(bulletins);
				//console.log(joinedBulletins);
				res.json({joinedBulletins : bulletins});
			});
		}
	});


	//Edit bulletinBoard name
	app.put('/bulletins/:id', isLoggedIn, function(req, res){
		BulletinBoard.update({_id : req.params.id}, {$set: { title : req.body.title}}, false, false);
	  res.json({serverResponse: "Name edited"});
	});

	//Route for sharing bulletinBoards
	app.put('/shareBulletin/:bulletinID', isLoggedIn, function(req, res){
		var friendList = req.body;
		var bulletinID = req.params.bulletinID;

		console.log(friendList[0].friendUser._id);

		for(var i = 0; i < friendList.length; i++){
			//Put the user in the bulletinBoard
			BulletinBoard.update({_id : bulletinID}, {$push:{
				sharedWith : {
					friendID : friendList[i].friendUser._id,
				}
			}}, false, false);
		}

		//Update the fields in the friends
		for(var i = 0; i < friendList.length; i++){
			//Put the bulletinBoard in the users
			User.update({_id : friendList[i].friendUser._id}, {$push : {
				sharedBulletins: {
					bulletinID : req.params.bulletinID,
				}
			}}, false, false);
		}

		res.json({serverResponse : "Shared bulletinBoard"});

	});

	// =====================================
	// User and friend Related =============
	// =====================================


	var FriendRequest = require('./models/friendRequest');

	//Send FriendRequest ie create a new Friendrequest object
	//TODO proper error checking
	app.post('/FriendRequest', isLoggedIn, function(req, res){

		//Test if the users are already friends.
		var isfriends = false;
		var hasPending;
		if(req.user._id == req.body._id){
			res.json({serverResponse : "That's you"});
		}
		else{
			FriendRequest.find({fromID : req.user._id, toID : req.body._id}, function(err, friendsReqs){
				if(friendsReqs.length > 0)
					hasPending = true;
				else
					haspending = false;

					FriendRequest.find({fromID : req.body._id, toID : req.user._id}, function(err, friendsReqs){
						if(friendsReqs.length > 0)
							hasPending = true;
						else
							haspending = false;

						for(var i = 0; i < req.user['friends'].length; i++){
							if(req.user['friends'][i].friend.friendUser._id == req.body._id){
								isfriends = true;
								break;
							}
						}
						if(isfriends){
							res.json({serverResponse : "You are already friends"});
						}
						else{
							//Test if there is a pending friendRequest
							if(hasPending){
								res.json({serverResponse : "Friend request is pending!"});
							}
							else{
								console.log("Now a friendRequest can be sent!");
								new FriendRequest({
									fromID : req.user._id,
									toID 	: req.body._id,
								}).save(function(err, requests, count){
									res.json({serverResponse : "Friend Request Sent"});
								});
							}
						}
					});
			});
		}
	});

	//Get the friendRequests
	app.get('/FriendRequests', isLoggedIn, function(req, res){
		var outRequests = [];
		var inRequests = [];

		//Start with sent ie from the logged in user notifications
		FriendRequest.find({fromID : req.user._id}, function(err, requests){
			outRequests = requests;

			//Find the incoming requests
			FriendRequest.find({toID : req.user._id}, function(err, requests){
				inRequests = requests;
				res.json({incomingFriendRequests : inRequests, pendingFriendRequests : outRequests});
			});
		});
	});

	app.delete('/FriendRequests/:id', isLoggedIn, function(req, res){
		console.log(req.params);
		FriendRequest.find({toID : req.user._id, fromID : req.params.id}).remove().exec();
		FriendRequest.find({toID : req.params.id, fromID : req.user._id}).remove().exec();

		res.json({serverResponse : "Friend Request Cancelled"});
	});

	//Route for adding friends to a profile
	app.post('/ConfirmFriendRequest', isLoggedIn, function(req, res){

		//Receive the friendRequest
		console.log(req.body);

		User.find({_id : req.body._id}, function(err, user){

			//Update the logged in user's friendsField
			User.update({_id : req.user._id}, {$push : {friends : {
					friend : {
						friendUser : user[0],
					}
			}}}, false, false);
		});

		//Update the friendsField of the other User
		User.find({_id : req.user._id}, function(err, user){
			User.update({_id : req.body._id}, {$push : {friends : {
					friend : {
						friendUser : user[0],
					}
			}}}, false, false);
		});
		FriendRequest.find({toID : req.user._id, fromID : req.body._id}).remove().exec();
		res.json({serverResponse : "Friend Request Accepted"});

	});

	//Get the user's friends and erase the password.
	app.get('/friends', isLoggedIn, function(req, res){
		if(typeof req.user['friends'] !== 'undefined' && req.user['friends'].length > 0){
			//console.log(req.user['friends'][0].friend.friendUser[0]['local'].password);

			for(var i = 0; i < req.user['friends'].length; i++){
				req.user['friends'][i].friend.friendUser['local'].password = "";
			}
			res.json({Friends: req.user['friends']});
		}
	});

	//Route for unfriending friends
	app.delete('/friend/:id', isLoggedIn, function(req, res){
		//Remove the users from eachother's user Objects
		//Doesn't work right now. Timeboxing!

		User.update({_id : req.user._id}, {$pull : {
			friends : {
				friend : {
					friendUser : {
						_id : req.params.id,
					}
				}
			}
		}}, false, false);


		User.update({_id : req.params.id}, {$pull : {
			friends : {
				friend : {
					friendUser : {
						_id : req.user._id,
					}
				}
			}
		}}, false, false);

		res.json({serverResponse : 'Friend Unfriended!'});


		User.update({_id : bulletinBoard[0].sharedWith[i].friendID}, {$pull : {
			sharedBulletins : {
					bulletinID : req.params.id,
				}
			}
		}, false, false);

	});

	//get the users in the system to be able to add friends
	app.get('/users', isLoggedIn, function(req, res){
		User.find(function(err, users){
			var userNames = [];

			for(var i = 0; i < users.length; i++){
				var searchUser = {};
				searchUser = users[i];
				searchUser['local'].password = '';
				userNames[i] = searchUser;
			}
			res.json({searchUsers : userNames});
		});
	});

	//Changing the local email
	app.post('/userEmail', isLoggedIn, function(req, res){

		User.findOne({'local.email' :  req.body.address}, function(err, user){
			if(user){
				res.json({serverResponse : 'Email already taken'});
			}
			else{
				User.update({_id : req.user._id}, {$set: {'local.email': req.body.address}}, false, false);
				res.json({serverResponse : 'Email Edited'});
			}
		});
	});

	//Changing the password
	app.post('/userPassword', isLoggedIn, function(req, res){

		User.findOne({_id :  req.user._id}, function(err, user){
			if(req.body.first !== req.body.second){
				res.json({serverResponse : 'Passwords Must Match!'});
			}
			else if(req.body.first === req.body.second){
				var newPass = user.generateHash(req.body.first);
				User.update({_id : req.user._id}, {$set : {'local.password': newPass}}, false, false);
				res.json({serverResponse : 'Password changed'});
			}
		});


	});


	// =====================================
	// Stickies ============================
	// =====================================

	var Sticky = require('./models/sticky');

	//Create a new sticky
	app.post('/stickies', isLoggedIn, function(req, res){

		User.update({_id : req.user._id}, { $inc : {
					'stats.nrStickies' : 1,
				}
			}, false, false);

		new Sticky({
			title        : req.body.title,
			userID    	 : req.user._id,
			bulletinID	 : req.body['activeBulletin']._id,
			content      : req.body.content,
			positionX    : "10",
			positionY    : "50",
		}).save(function(err, sticky, count){
			res.json({serverResponse: "Sticky Created"});
		});
	});

	//Route for getting all the stickies for the given bulletinboard and user
	app.get('/stickies/:bulletinID', isLoggedIn, function(req, res){
		/*Sticky.find({bulletinID : req.params.bulletinID}, function(err, stickies){
			res.json(stickies);
		});*/


		BulletinBoard.find({_id : req.params.bulletinID}, function(err, bulletinBoard){
			var currentBulletin = bulletinBoard[0];
			var currentBulletinShareList = currentBulletin.sharedWith;
			var isOnJoined = false;


			for(var i = 0; i < currentBulletinShareList.length; i++){
				if(req.user._id == currentBulletinShareList[i].friendID || req.user._id == currentBulletin.userID){
					isOnJoined = true;
					break;
				}
			}
			console.log(isOnJoined);
			if(isOnJoined == true){
				Sticky.find({bulletinID : req.params.bulletinID}, function(err, stickies){
					res.json(stickies);
				});
			}
			else{
				Sticky.find({userID : req.user._id, bulletinID : req.params.bulletinID}, function(err, stickies){
					res.json(stickies);
				});
			}
		});


	});

	//Route for deleting a sticky
	app.delete('/sticky/:id', isLoggedIn, function(req, res){
		console.log(req.body);
		Sticky.find({_id : req.params.id}).remove().exec();
		res.json({serverResponse: "Sticky Removed"});
	});

	//Update the content coordinates
	app.post('/updateObjectCoords', isLoggedIn, function(req, res){
		Sticky.update({_id : req.body._id}, {$set: { positionX : req.body.positionX,
																									positionY : req.body.positionY
																								}}, false, false);

		YoutubeVideo.update({_id : req.body._id}, {$set: { positionX : req.body.positionX,
																												positionY : req.body.positionY
																								}}, false, false);

		ImagePic.update({_id : req.body._id}, {$set: { positionX : req.body.positionX,
																										positionY : req.body.positionY
																								}}, false, false);
		res.json({serverResponse: "Position Saved"});
	});



	// =====================================
	// Youtube Clips =======================
	// =====================================

	var YoutubeVideo = require('./models/youtubeVideo');


	//Create a new YoutubeVideo
	app.post('/youtubes', isLoggedIn, function(req, res){
		console.log(req.body);

		User.update({_id : req.user._id}, { $inc : {
					'stats.nrYoutubes' : 1,
				}
			}, false, false);

		new YoutubeVideo({
			bulletinID : req.body['activeBulletin']._id,
			userID     : req.user._id,
			youtubeID  : req.body.videoID,
			positionX  : "10",
			positionY  : "50",
		}).save(function(err, youtube, count){
			res.json({serverResponse: "Clip Created"});
		});

	});

	//Get the the youtube videos for that user and bulletinBoard
	app.get('/youtubes/:bulletinID', isLoggedIn, function(req, res){

		BulletinBoard.find({_id : req.params.bulletinID}, function(err, bulletinBoard){
			var currentBulletin = bulletinBoard[0];
			var currentBulletinShareList = currentBulletin.sharedWith;
			var isOnJoined = false;


			for(var i = 0; i < currentBulletinShareList.length; i++){
				if(req.user._id == currentBulletinShareList[i].friendID || req.user._id == currentBulletin.userID){
					isOnJoined = true;
					break;
				}
			}
			console.log(isOnJoined);
			if(isOnJoined == true){
				YoutubeVideo.find({bulletinID : req.params.bulletinID}, function(err, youtubes){
					res.json(youtubes);
				});
			}
			else{
				YoutubeVideo.find({userID : req.user._id, bulletinID : req.params.bulletinID}, function(err, youtubes){
					res.json(youtubes);
				});
			}
		});

	});

	app.delete('/youtube/:id', isLoggedIn, function(req, res){
		console.log(req.body);
		YoutubeVideo.find({_id : req.params.id}).remove().exec();
		res.json({serverResponse: "Youtube Removed"});
	});

	// =====================================
	// Images ==============================
	// =====================================

	var fs = require('fs');
	var ImagePic = require('./models/image');


	//Upload image and create database entry
	app.post('/imageUpload', isLoggedIn, function(req, res){
		//First create folder for that user, if folder already exists, just put the image there
		console.log(req.body.bulletin);
		//console.log(req.files.image);

		var userId = req.user._id;

		var newPath = './public/img/userImages/' + req.user._id + '/';

		var target_path = "";

		//Check if the path exists
		if (fs.existsSync(newPath)) {
    	targetPath = newPath;
		}
		else{
			fs.mkdir(newPath, 0777, true, function(err){
				if(err){
					console.log(err);
				}
				else{

				}
			});
			targetPath = newPath;
			console.log('Directory: ' + targetPath + ' created');
		}

		User.update({_id : req.user._id}, { $inc : {
					'stats.nrImages' : 1,
				}
			}, false, false);

		new ImagePic({
			userID       : req.user._id,
			bulletinID   : req.body.bulletin,
			positionX    : '10',
			positionY    : '50',
			filePath     : '/userImages/' + req.user._id + '/' + req.files.image.name,
		}).save(function(err, image, count){
			console.log("Image created");
			// get the temporary location of the file
			var tmp_path = req.files.image.path;
			// set where the file should actually exists - in this case it is in the "images" directory
			target_path = targetPath + req.files.image.name;
			// move the file from the temporary location to the intended location
			fs.rename(tmp_path, target_path, function(err) {
					if (err) throw err;
					// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
					fs.unlink(tmp_path, function() {
							if (err) throw err;

					});
			});
		});
		res.json({serverResponse: "image uploaded"});

	});

	//Get images
	app.get('/images/:bulletinID', isLoggedIn, function(req, res){
		BulletinBoard.find({_id : req.params.bulletinID}, function(err, bulletinBoard){
			var currentBulletin = bulletinBoard[0];
			var currentBulletinShareList = currentBulletin.sharedWith;
			var isOnJoined = false;


			for(var i = 0; i < currentBulletinShareList.length; i++){
				if(req.user._id == currentBulletinShareList[i].friendID || req.user._id == currentBulletin.userID){
					isOnJoined = true;
					break;
				}
			}
			console.log(isOnJoined);
			if(isOnJoined == true){
				ImagePic.find({bulletinID : req.params.bulletinID}, function(err, images){
					res.json(images);
				});
			}
			else{
				ImagePic.find({userID : req.user._id, bulletinID : req.params.bulletinID}, function(err, images){
					res.json(images);
				});
			}
		});
	});

	app.delete('/image/:id', isLoggedIn, function(req, res){
		//Delete the image from the server
		ImagePic.find({_id : req.params.id}, function(err, image){
			//console.log(image);

			var imagePath = './public/img'+image[0].filePath;
			console.log(imagePath);

			fs.unlink(imagePath, function(err){
				if(err) throw err;
				console.log("Image removed from server");
			})
		});
		//Remove the image from the database

		ImagePic.find({_id : req.params.id}).remove().exec();
		res.json({serverResponse : 'Image removed'});
	});


	// ==============================================================
	// Fat deletion functions that depend on deleting many things====
	// ==============================================================

	//Delete a bulletin
	//This function first removes all the content, and lastly the bulletinBoard
	app.delete('/bulletin/:id', isLoggedIn, function(req, res){


		//Check if the bulletin is shared
		BulletinBoard.find({_id : req.params.id}, function(err, bulletinBoard){
			if(bulletinBoard[0].sharedWith.length > 0){
				for(var i = 0; i < bulletinBoard[0].sharedWith.length; i++){
					User.update({_id : bulletinBoard[0].sharedWith[i].friendID}, {$pull : {
						sharedBulletins : {
								bulletinID : req.params.id,
							}
						}
					}, false, false);
				}
			}
		});

		//Firstly remove the sticky notes
		Sticky.find({bulletinID : req.params.id}).remove().exec();

		//Remove the youtubeVideos
		YoutubeVideo.find({bulletinID : req.params.id}).remove().exec();

		//TODO Remove the images!

		//Remove the bulletinBoard
		BulletinBoard.find({_id : req.params.id}).remove().exec();

		res.json({serverResponse: "BulletinBoard removed"});
	});


	//Catch all route
	app.get('*', function(req, res) {
		res.redirect('/home');
	});

};



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
