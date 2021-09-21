var mongoose = require("mongoose");

var AwardSchema = new mongoose.Schema({
	title : "String",
	date  : "String",
	text : "String",
	author : {
		       id: {
			      type : mongoose.Schema.Types.ObjectId,
			      ref : "User"
		        }
	          }	
});

module.exports = mongoose.model("Award" , AwardSchema);