var mongoose = require("mongoose");

var WorkexprienceSchema = new mongoose.Schema({
	role : "String",
	companyname : "string",
	workedfrom :"string",
	Workedto  : "string",
	city : "string" ,
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

module.exports = mongoose.model("Workexp" , WorkexprienceSchema);