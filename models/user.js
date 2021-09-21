var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	role  : "String",
	personaldetails : {
		 gender : "string",
	     DOB : "string",
		 Paddress : "String",
		 city : "string",
	     state : "string",
		 country  : "string",
		 zipcode : Number,
		 contnum : Number,
		 Altcontnum : Number,
		 aadhardetails : {
			 aadharnum : Number,
			 aadharimage  : [{
				 dataurl : "String",
				 dataid : "String"
			 }]
			} 
	},
	organizationdetails  : {
		companyname : "String",
		websiteurl  : "String",
		totalemployees : Number,
		aboutcompany : "String"
	},
	local : {
		email : "string",
		password  : "string",
		firstname : "string",
		lastname : "string",
		avatar : "string",
		avatarid : "string",
		emailverified : {  type: Boolean,  default: false },
		verifyEmailToken : {type : String , default : undefined},
		resetPasswordToken : {type : String , default : undefined},
		resetPasswordExpires : {type : Date , default : undefined},
	},
	googleauth : {
		fullname : "string",
		firstname : "string",
		lastname : "string",
		avatar : "string",
		avatarid : "string",
		email : "string",
		googleid : "string"
	},
	linkedinauth : {
		fullname : "string",
		firstname : "string",
		lastname : "string",
		avatar : "string",
		avatarid : "string",
		email : "string",
		linkedinid : "string"
	},
	notifications : [
		{
			 type : mongoose.Schema.Types.ObjectId,
			 ref : "Notification"
		}
	]
	
});

module.exports = mongoose.model("User" , UserSchema);