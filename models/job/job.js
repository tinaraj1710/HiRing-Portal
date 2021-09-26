var mongoose = require("mongoose");

var JobSchema = new mongoose.Schema({
	employer  : {
		type : mongoose.Schema.Types.ObjectId,
		ref : "User"	
	},
	employee : {
		type : mongoose.Schema.Types.ObjectId,
		ref : "User"	
	},
	consultant : {
		type : mongoose.Schema.Types.ObjectId,
		ref : "User"
	},
	to : {
		type : mongoose.Schema.Types.ObjectId,
		ref : "User"
	},
	position : "String",
	status : "String",
	joiningdate : Date,
	offerletter : {
	    type : mongoose.Schema.Types.ObjectId,
		ref : "OfferLetter"	
 	},
	interview : [{
		type : mongoose.Schema.Types.ObjectId,
		ref : "Interview"
	}],
	joiningdata  :"String",
	author : {
		 type : mongoose.Schema.Types.ObjectId,
		 ref : "User"	
	},
	token : {type :"String" , default : undefined}
});

module.exports = mongoose.model("Job" , JobSchema);