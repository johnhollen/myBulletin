var mongoose = require('mongoose');

var youtubeVideoSchema = mongoose.Schema({
  bulletinID : String,
  userID     : String,
  youtubeID  : String,
  positionX  : String,
  positionY  : String,
});

module.exports = mongoose.model('YoutubeVideo', youtubeVideoSchema);
