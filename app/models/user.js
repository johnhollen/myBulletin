//Model for the users.
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var User = require('./user');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    friends          : [{
        friend       : {
          friendUser   : User,
        },
    }],
    sharedBulletins  : [{
      bulletinID     : String,
    }],
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        img          : String,
    },
    stats            :{
      nrBulletins    : {type : Number, default : 0},
      nrStickies     : {type : Number, default : 0},
      nrYoutubes     : {type : Number, default : 0},
      nrImages       : {type : Number, default : 0},
    },
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
