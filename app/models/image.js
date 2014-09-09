var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
  userID       : String,
  bulletinID   : String,
  positionX    : String,
  positionY    : String,
  filePath     : String,
});

module.exports = mongoose.model('Image', imageSchema);
