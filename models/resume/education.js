var mongoose = require("mongoose");

var EducationSchema = new mongoose.Schema({
	degree  : "String",
	studyfield : "String",
	grade : "String",
	collagename : "String",
	studiedfrom : "String",
	studiedto : "String",
	city : "String",
	country : "String",
	text : "String",
	filetitle : "String",
	fileurl : [{
		dataurl : "String",
		dataid : "String"
	   }],
	author : {
		       id: {
			      type : mongoose.Schema.Types.ObjectId,
			      ref : "User"
		        }
	          }	
});

module.exports = mongoose.model("Education" , EducationSchema);