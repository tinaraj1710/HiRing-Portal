var mongoose = require("mongoose");

var professionaldataSchema = new mongoose.Schema({
	position : "String",
	text : "String",
	author : {
		       id: {
			      type : mongoose.Schema.Types.ObjectId,
			      ref : "User"
		        }
	          }	
});

module.exports = mongoose.model("Profdata" , professionaldataSchema);