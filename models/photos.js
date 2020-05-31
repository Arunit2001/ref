const mongoose = require("mongoose")


var photoSchema = new mongoose.Schema({
	image: String,
	caption: String,
	comment:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}]
})

module.exports = mongoose.model("Photos", photoSchema)