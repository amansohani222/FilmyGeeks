var mongoose = require("mongoose");

var movieSchema = mongoose.Schema({
 imdbID: String,
 link: String,
 title: String,
 poster: String,
 author: {
  id: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "user"
  },
  username: String
 },
 comments: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: "comment"
 }]
});



module.exports = mongoose.model("movie", movieSchema);