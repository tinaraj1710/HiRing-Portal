var mongoose = require("mongoose");

var NotificationSchema = new mongoose.Schema({
	isRead : {type : Boolean , default : false},
	jobid : {
		 type : mongoose.Schema.Types.ObjectId,
		 ref : "Job"
	}
});

module.exports = mongoose.model("Notification" , NotificationSchema);