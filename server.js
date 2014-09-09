// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');

var app      = express();
//var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash 	 = require('connect-flash');
var server 	= require('http').createServer(app);
var io = require('socket.io').listen(server);

var configDB = require('./config/db');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration


app.configure(function() {

	// set up our express application
	app.use(express.static(__dirname + '/public'));
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms


	// required for passport
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});


// routes ======================================================================
require('./app/sockets.js')(io);
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
server.listen(8080);
console.log('The magic happens on port 8080');
