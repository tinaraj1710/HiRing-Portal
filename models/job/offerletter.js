var mongoose = require("mongoose");

var OfferLetterSchema = new mongoose.Schema({
	description : "String",
	document : [{
		dataid : "String",
		dataurl : "String"
	}],
	createddate : {type: Date, default: Date.now},
	expiring : Date,
	withdrawcomment  :"String",
	defaultcommentcandidate : {
	     from : {
	            type : mongoose.Schema.Types.ObjectId,
				ref : "User"
            },
	     comment : "String"
      } ,
	 defaultcommentcompany : {
	     from : {
	            type : mongoose.Schema.Types.ObjectId,
				ref : "User"
            },
	     comment : "String"
      } 
});

module.exports = mongoose.model("OfferLetter" , OfferLetterSchema);