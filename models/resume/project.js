var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema({
	title : "String",
	datefrom : "String",
	dateto  : "String",
	text : "String",
	author : {
		       id: {
			      type : mongoose.Schema.Types.ObjectId,
			      ref : "User"
		        }
	          }	
});

module.exports = mongoose.model("Project" , ProjectSchema);