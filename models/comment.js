const mongoose = require("mongoose")


var commentSchema = new mongoose.Schema({
	username: String,
	content: String 
})

module.exports = mongoose.model("Comment", commentSchema)