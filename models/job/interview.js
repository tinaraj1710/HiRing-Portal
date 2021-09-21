var mongoose = require("mongoose");

var InterviewSchema = new mongoose.Schema({
	title : "String",
	date : Date,
	status : "String",
	rejectcomment : "String" 
	
});

module.exports = mongoose.model("Interview" , InterviewSchema);