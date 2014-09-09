var mongoose = require('mongoose');

var friendRequestSchema = mongoose.Schema({
  fromID     : String,
  toID       : String,
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
