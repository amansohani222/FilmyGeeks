var mongoose = require("mongoose");
var replySchema = new mongoose.Schema({
	author: {
      id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
          },
       username: String
    },
	text: String
});
var Reply = mongoose.model("reply", replySchema);

module.exports = Reply;