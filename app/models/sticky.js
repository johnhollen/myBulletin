var mongoose = require('mongoose');

var stickySchema = mongoose.Schema({
  title        : String,
  userID       : String,
  bulletinID   : String,
  content      : String,
  positionX    : String,
  positionY    : String,
});

module.exports = mongoose.model('Sticky', stickySchema);
