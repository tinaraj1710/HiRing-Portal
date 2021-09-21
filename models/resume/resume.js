var mongoose = require("mongoose");

var ResumeSchema = new mongoose.Schema({
	workexperiences : [{
	                type : mongoose.Schema.Types.ObjectId,
		  			ref : "Workexperience"
	            	}],
	educations : [{
					type : mongoose.Schema.Types.ObjectId,
					ref : "Education"
				}],
	certificates : [{
					type : mongoose.Schema.Types.ObjectId,
					ref : "Certificate"
					}],
	awards : 	[{
		            type : mongoose.Schema.Types.ObjectId,
					ref : "Award"
				}],
	author : {
		       id: {
			      type : mongoose.Schema.Types.ObjectId,
			      ref : "User"
		        }
	          }	
});

module.exports = mongoose.model("Resume" , ResumeSchema);