var mongoose = require("mongoose");

var OtherdataSchema = new mongoose.Schema({
	title : "String",
	description  : "String",
	author : {
		       id: {
			      type : mongoose.Schema.Types.ObjectId,
			      ref : "User"
		        }
	          }	
});

module.exports = mongoose.model("Other" , OtherdataSchema);