var mongoose = require('mongoose');
var User = require('./user');

var bulletinSchema = mongoose.Schema({
  title     : String,
  userID    : String,
  sharedWith: [{
    friendID: String,
  }],
});

module.exports = mongoose.model('BulletinBoard', bulletinSchema);
