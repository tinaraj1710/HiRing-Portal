var  router           =    require("express").Router(),
	 User             =    require("../models/user"),
	 Job              =    require("../models/job/job"),
	 OfferLetter      =    require("../models/job/offerletter"),
	 Notification     =    require("../models/notification"),
	 Profdata         = 	require("../models/resume/professionaldata.js"),
	 Interview        =    require("../models/job/interview"),
	 moment           =    require("moment"),
	 bcrypt           =    require("bcrypt"),
	 nodemailer       =    require("nodemailer"),
	 middleware       =    require("../middleware"),
     multer           =    require("multer"),
     twilio           =    require("twilio");



const { randomBytes } = require('crypto');

// Google Oauth Setup ====================================
const { google }  = require("googleapis");

const oAuth2Client  = new google.auth.OAuth2(
	process.env.GMAIL_GOOGLE_CLIENT_ID , 
	process.env.GMAIL_GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URL
)

oAuth2Client.setCredentials({ refresh_token : process.env.GOOGLE_REFRESH_TOKEN });
// =======================================================


// Twilio Setup 
var client = twilio( 
	process.env.TWILIO_SID,
	process.env.TWILIO_TOKEN
);

// storage file name from multer 
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

// checks and only allow images 
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) { 
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});

// cloudinary config
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: "dgohuy1mb", 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

// send offerletter route
router.post("/createjob/:id" , middleware.isLoggedin ,  upload.array('filedata') , async function(req, res){
	try{
		User.findById(req.params.id , function(err , user){
			if(err)
				return console.log(err);
			
			//  Check for Organization details of employer and not exist then send them to home home
			if(user.organizationdetails.companyname && user.organizationdetails.websiteurl && user.organizationdetails.totalemployees && user.organizationdetails.aboutcompany){
				// CRAETE JOB OBJECT WITH SUB-FIELDS
			job = {
				position : req.body.position,
				status : "offerletter-sent"
			}
	
			// CRAETE OFFER LETTER WITH SUB-FIELDS
			offerletter = {
				description : req.body.text,
				expiring :    req.body.expdate,
			  }
			
			try{
				// CREATE NEW JOB 
				Job.create(job , function(err , job){
				   if(err)
					return console.log(err);
					
					// ROLE OF THE USER ACCORDING TO THAT ADD JOB UPDATE JOB SCEHEMA 
					if(user.role === "employer"){
						job.employer = req.params.id;
					}
					
					if(user.role === "consultant"){
						  job.consultant = req.params.id;
					}
					// MAKE JOB AUTHOR AS EMPLOYEE  OR CONSULTANT DEPENDING UPON WHO IS SEND 
					job.author = req.params.id;
					job.save();
					// CREATE OFFER LETTER
					OfferLetter.create(offerletter  , async function(err , offerletter){
						if(err)
							return console.log(err);
						
						// UPLOAD FILE TO CLOUDINARY AND UPDATE OFFERLETTER FIELDS
						if(req.files.length > 0){
							var filesarray = [];
							for(var file of req.files){
								var result = await upload_get_url(file.path);
								var dataobj = {
									dataurl : result.secure_url,
									dataid : result.public_id
								}
								filesarray.push(dataobj);
							}
						}else{
							var filesarray = [];
						 }
						 offerletter.document = filesarray;
						 offerletter.save();
						 var offerletterid = offerletter._id;
						 // CREATE INTERVIEW FIELDS
						 // FIND USER WITH EAMIL THAT EMPLOYEE SEND AND THEN SEND EMAIL TO THAT FIELD
							var user = await User.find({"local.email" : req.body.email});
							if(user.length === 0){
								user = await User.find({"googleauth.email" : req.body.email});
								if(user.length === 0){
									user = await User.find({"linkedinauth.email" : req.body.email}); 
									}
								}
								
								 if(user.length > 0){
									 // USER EXIST IN DB SO JUST MAIL THAT USER
									  job.to = user[0]._id;
								 }else{
									 // USER NOT EXIST CREATE NEW USER
									let user = await User.create({"local.email" : req.body.email});
									 user.role = "candidate";
									 user.save();
									 job.to = user._id;
								 }
								 //  SAVE INTERVIEW ID TO JOB OBJECT
								 job.offerletter = offerletterid;
								 await job.save();
								 // SEND EMAIL TO USER WITH FUTHER DETAILS
								 
								 var notification = await Notification.create({"jobid" : job._id});
								 notification.save();
								 
								var candidateuser = await User.findById(job.to);
								candidateuser.notifications.push(notification._id);
								candidateuser.save();
	
								const accessToken = await oAuth2Client.getAccessToken();
								let smtpTransport = nodemailer.createTransport({
									host: 'smtp.gmail.com',
									port: 465,
									secure: true,
									service: 'gmail',
									auth : {
											type : "OAUTH2",
											user : process.env.PERSONAL_EMAIL,
											clientId: process.env.GMAIL_GOOGLE_CLIENT_ID,
											clientSecret : process.env.GMAIL_GOOGLE_CLIENT_SECRET,
											refreshToken : process.env.GOOGLE_REDIRECT_URL,
											accessToken : accessToken.token
									}
								});
	
								let token = await randomBytes(20).toString('hex');
								job.token = token;
								await job.save();
								var mailOptions = {
									to: req.body.email,
									from: process.env.PERSONAL_EMAIL,
									subject: 'Job Request',
									text: 'Please click the link to be a part of job process\n\n' + process.env.WEBSITEURL + '/jobverify/' + token + '\n\n' 
								};
	
								smtpTransport.sendMail(mailOptions, function(err){
									if(err){
										req.flash("error" , "Something went wrong. please try again.");
									}else{
										req.flash("success" , "Offer Letter is send to " + req.body.email);
										res.redirect('/user/' + req.params.id);
									}
								});
								
					});
				});
				}catch(err){
					req.flash("error" , "Something went wrong");
					res.redirect("/user/" + req.params.id);
				}
			}else{
				req.flash("error" , "Please update or fill your organizationdetails");
				res.redirect("/user/" + req.user._id);
			}
		});

	}catch(err){
		req.flash("error" , err.message);
		res.redirect('/user/' + req.params.id);
	}
});


// Edit offer letter that is send but not accepted
router.get("/user/:id/editofferletter/:jobid" , middleware.isLoggedin , async function(req , res){
	if(req.user._id.toString() === req.params.id.toString()){
		
            var jobobj = await Job.findById(req.params.jobid).populate("author to interview offerletter");
			var employer  = jobobj.author;
	        var candidate = jobobj.to;
			var totaloffletterofcandidate = await Job.find({"to" : candidate._id});
			var totaldefaulted = 0;
			for(var job of totaloffletterofcandidate){
				if(job.status === "defaulted"){
					totaldefaulted = totaldefaulted  + 1;
				}
			}
		
		    var profdata = await Profdata.find({"author.id" : candidate._id});
		
		    res.render("employer/edit-offerletter.ejs" , {employer : employer , candidate : candidate , profdata : profdata , job : jobobj , totaldefaulted : totaldefaulted });		
	}else{
		req.flash("error" , "You don't have permission");
		res.redirect("/user/" + req.params.id);
	}
});


// Edit offer letter post route
router.post("/user/:id/editofferletter/:jobid" , middleware.isLoggedin , upload.array('filedatas') , async function(req , res){
	// If the sender is not that Employee then redirect to Offer Letter page
	if(req.user._id.toString() === req.params.id.toString()){
		
		var foundjob = await Job.findById(req.params.jobid).populate("to author offerletter");
		if(foundjob.status === "offerletter-sent"){
			// Save All Change and redirect to offerletter page
			var offerletter = foundjob.offerletter;
			offerletter.description = req.body.text;
			offerletter.expiring = req.body.expdate;
			foundjob.position = req.body.position;
			await foundjob.save();
			offerletter.save();
			
			// If user wants new file to upload then this will work
			if(req.files.length > 0){
				for(var file of req.files){
					var result = await upload_get_url(file.path);
					var dataobj = {
						dataurl : result.secure_url,
						dataid : result.public_id
					}
					offerletter.document.push(dataobj);
				}
				offerletter.save();
			}
	
		    res.redirect("/user/" + req.params.id + "/employer/offerletter/" + foundjob._id);
		}else{
			// Redirect To OfferLetter Page
			req.flash("error" , "OfferLetter is Already Accepted so you can not change");
		   res.redirect("/user/" + req.params.id + "/employer/offerletter/" + foundjob._id);
		}

	}else{
		req.flash("error" , "You don't have permission");
		res.redirect("/user/" + req.params.id);
	}
	
});


// Edit Offerletter file delete router
router.get("/user/:id/editofferletter/:jobid/delpdf/:dataid" , middleware.isLoggedin , async function(req , res){

	if(req.user._id.toString() === req.params.id.toString()){
		// Find the offerletter
		var job  = await Job.findById(req.params.jobid).populate("to author offerletter");
		for(var i = 0 ; i < job.offerletter.document.length ; i++){
			if(job.offerletter.document[i].dataid === req.params.dataid){
				// Delete offerletter pdf from data filesarray
				var dataid = req.params.dataid; 
				await cloudinary.v2.uploader.destroy(dataid);
				job.offerletter.document.splice(i,1);
				await job.offerletter.save();
			}
		}
		
	    // Redirect to Edit page
		res.redirect("/user/" + req.user._id + "/editofferletter/" + job._id);
		
		
	}else{
		req.flash("error" , "You don't have the premission to do that");
		res.redirect("/user/" + req.params.id + "/editofferletter/" + req.params.jobid);
	}
});

// Send offerletter to those candidate who have been part of interview process
router.post("/offerletter/:jobid" , middleware.isLoggedin  ,  upload.array('filedata') ,  function(req,res){
	Job.findById(req.params.jobid).populate("interview").exec( async function(err , foundjob){
		if(err)
			return console.log(err);
		
		var sender = await User.findById(foundjob.author);
		var totalinterviews = foundjob.interview.length;
	    var latestinterview = foundjob.interview[totalinterviews - 1];
		latestinterview.status = "cleared";
		latestinterview.save();
		// craete offerletter
		var offerletterobj = {
				description : req.body.text,
				expiring :req.body.expdate,
	     }
		
		 OfferLetter.create(offerletterobj , async function(err , offerletter){
			 if(err)
				 return console.log(err);
			 
			 try{
			
				 if(req.files.length > 0){
						var filesarray = [];
						for(var file of req.files){
							var result = await upload_get_url(file.path);
							var dataobj = {
								dataurl : result.secure_url,
								dataid : result.public_id
							}
							filesarray.push(dataobj);
						}
					}else{
						var filesarray = [];
	                 }
					 offerletter.document = filesarray;
					 await offerletter.save();
					 foundjob.offerletter = offerletter._id;
				     foundjob.status = "offerletter-sent";
			         await foundjob.save();
				      
				     // CREATE INTERVIEW FIELDS
					 // FIND USER WITH EAMIL THAT EMPLOYEE SEND AND THEN SEND EMAIL TO THAT FIELD
					 var user = await User.findById(foundjob.to);
					 if(user.local.email){
						 var username  = user.local.firstname + " "  + user.local.lastname;
						 var useremail = user.local.email;
					 }else if(user.googleauth.email){
						 var username = user.googleauth.fullname;
						 var useremail = user.googleauth.email;
					 }else{
						 var username = user.linkedinauth.fullname;
						 var useremail = user.linkedinauth.email;
					 }
				     // Generate notification for candidate
				     var notification = await Notification.create({"jobid" : foundjob._id});
					 notification.save();
					         
					 var candidateuser = await User.findById(foundjob.to);
					 candidateuser.notifications.push(notification._id);
					 candidateuser.save();
					
					 const accessToken = await oAuth2Client.getAccessToken();
					 let smtpTransport = nodemailer.createTransport({
						host: 'smtp.gmail.com',
						port: 465,
						secure: true,
						service: 'gmail',
						auth : {
								type : "OAUTH2",
								user : process.env.PERSONAL_EMAIL,
								clientId: process.env.GMAIL_GOOGLE_CLIENT_ID,
								clientSecret : process.env.GMAIL_GOOGLE_CLIENT_SECRET,
								refreshToken : process.env.GOOGLE_REDIRECT_URL,
								accessToken : accessToken.token
						}
					 });

							
					var mailOptions = {
						to: useremail,
						from: process.env.PERSONAL_EMAIL,
						subject: 'Job Request',
						text: 'Hey you have offerletter from ' + sender.local.firstname + ' ' + sender.local.lastname + '\n\n To see your offerletter please click the link below \n\n' + process.env.WEBSITEURL + '/user/' + user._id  + '\n\n' 
					};

					smtpTransport.sendMail(mailOptions, function(err){
						if(err){
							req.flash("success" , "Something went wrong");
							res.redirect('/user/' + sender._id);
						}else{
							 req.flash("success" , "Offer Letter is send to " + username );
							 res.redirect('/user/' + sender._id + "/employer/offerletter/" + foundjob._id);
						}
					});
				    
			  }catch(err){
				  req.flash("error" , err);
				  res.redirect("/user/" + sender._id);
			  } 
		 });	
	});
});


// DO THE PROCESS OF CREATION
router.get("/jobverify/:token" , function(req , res){
	Job.find({token : req.params.token} , async function(err , job){
		if(err)
			return console.log(err);
		
		try{
			 var user = await User.findById(job[0].to);
			 if(user.local.email){
				 // If user is newely created then do this
					if(user.local.emailverified === false){
						user.local.emailverified = true;
						user.save();
						res.render("authentication/unknown-signup.ejs" , {user : user});
					}else{
						// USER IS REGISTERD AS LOCAL STRATEGY
					req.flash("success" , "Please Login with " + user.local.email + " email address to view your job offer");
					    res.redirect("/dashboard/auth/login");
					}	
				}else{
					// GOOGLE AUTH OR LINKEDIN AUTH
					if(user.googleauth.email){
						// USER HAVE GOOGLE ACCOUNT
						req.flash("success" , "Please Login with " + user.googleauth.email + " email address to view your job offer");
					    res.redirect("/dashboard/auth/login");
					}else{
						// USER HAVE LINKEDIN ACCOUNT
						req.flash("success" , "Please Login with " + user.linkedinauth.email + " email address to view your job offer");
					    res.redirect("/dashboard/auth/login");
					}	
				}
		}catch(err){
			console.log(err);
		} 
	});
});


// USER SENDS DATA THROGH UNKNOWN-REGISTER PAGE 
router.post("/user/:id/signup"  , async function(req , res){
	// CHECK FOR BOTH PASSWORD SHOULD BE SAME
	if(req.body.confpass === req.body.password){
		 var hashedpass = await bcrypt.hash(req.body.password , 10);
		 var newuser = {
			"local.password" : hashedpass,
			"local.firstname" : req.body.firstname,
			"local.lastname" : req.body.lastname
	     }
	    User.findByIdAndUpdate(req.params.id , newuser  , function(err , user){
		  if(err)
			 return console.log(err);
		   
			req.login(user , function(err){
				if(err)
					return console.log(err);
			
				 res.redirect("/user/" + user._id);
			});
	     });
	     }else{
		    req.flash("error" , "Your password and confirm password does not match");
		    res.redirect("/dashboard/candidate/register");
	   }
});

// aadhar details save router
router.post("/verifyaadhar/:userid/job/:jobid" , middleware.isLoggedin ,  upload.array('filedata') , async function(req , res){
		try{     
				     var finalnum = "+91" + req.body.phonenum;
					 var jsondata = {};
					 jsondata.number = req.body.phonenum;
					 jsondata.aadharnum  = req.body.aadharnum; 
			         jsondata.subdata = req.files[0].path;
					 client
						 .verify
						 .services(process.env.TWILIO_SERVICE_ID)
						 .verifications
						 .create({
							 to : finalnum,
							 channel : "sms"
					 }).then(function(data){
						 console.log("I am at here");
						 jsondata.status = 200;
						 res.json(jsondata);
					 }).catch(function(err){
						 console.log(err);
						 res.json(err);
					 });
						 
		 }catch(err){
			 req.flash("error" , err);
			 res.redirect("/user/" + req.params.userid);
		 }   
});


// OTP verification Route

router.post("/verifyotp/:userid/job/:jobid" , middleware.isLoggedin ,  upload.array('filedata') , async function(req , res){
		try{     
			    var responceobj = {};
			    
			    var finalnum = "+91" + req.body.phonenum;
				var code = req.body.code; 
				       client
						 .verify
						 .services(process.env.TWILIO_SERVICE_ID)
						 .verificationChecks
						 .create({
							 to : finalnum,
							 code : code
					 }).then(async function(data){
						   if(data.status === "approved"){
							        var user = await User.findById(req.params.userid);
								    if(user.personaldetails.aadhardetails.aadharimage.length > 0){
									  for(var i = 0 ; i <  user.personaldetails.aadhardetails.aadharimage.length ; i++){
										   var dataid = user.personaldetails.aadhardetails.aadharimage[i].dataid; 
										   await cloudinary.v2.uploader.destroy(dataid);
									  }
									 user.personaldetails.aadhardetails.aadharimage.splice(0, user.personaldetails.aadhardetails.aadharimage.length); 
								 }

							     
									var result = await upload_get_url(req.body.files);
									var dataobj = {
											dataurl : result.secure_url,
											dataid : result.public_id
										}
							     user.personaldetails.aadhardetails.aadharimage.push(dataobj);
								 user.personaldetails.aadhardetails.aadharnum  = req.body.aadharnum; 
								 user.save();
								 Job.findById(req.params.jobid).populate("author").exec(async function(err , job){
								   if(err)
									   return console.log(err);

								   job.status = "accepted";
								   job.save();
								   var offersender = "";
								   if(job.author.local.email){
									   offersender = job.author.local.firstname  + " " + job.author.local.lastname;
								   }else if(job.author.googleauth.email){
									   offersender = job.author.googleauth.fullname;
								   }else{
									   offersender = job.author.linkedinauth.fullname;
								   }

									var notification = await Notification.create({"jobid" : job._id});
									notification.save();

									var senderuser = await User.findById(job.author);
									senderuser.notifications.push(notification._id);
									senderuser.save();
						      });
							   responceobj.status = 200;
							   res.json(responceobj);
					   }else{
						   responceobj.status = 400;
						   res.json(responceobj);
					   }
					 }).catch(function(err){
						 req.flash("error" , "Something went wrong. please again accept offerletter");
			             res.redirect("/user/" + req.params.userid);
					 });
						 
		 }catch(err){
			 req.flash("error" , err);
			 res.redirect("/user/" + req.params.userid);
		 }   
});


// make default offer letter route
router.post("/makedefault/:jobid/:userid" , middleware.isLoggedin , function(req,res){
	Job.findById(req.params.jobid).populate("offerletter").exec(async function(err , foundjob){
		if(err)
			return console.log(err);
		
		try{
			    let user = await User.findById(req.params.userid);
			    var offerletter = foundjob.offerletter;
				if(user.role === "candidate"){
					offerletter.defaultcommentcandidate.from = user._id;
					offerletter.defaultcommentcandidate.comment = req.body.comment;
					await offerletter.save();
				}	
				if(user.role === "employer"){
					offerletter.defaultcommentcompany.from = user._id;
					offerletter.defaultcommentcompany.comment = req.body.comment;
					await offerletter.save();
				}
				
				foundjob.status = "defaulted";
				foundjob.save();
			    if(req.user.role === "candidate"){
					var notification = await Notification.create({"jobid" : foundjob._id});
					notification.save();
					         
					var employeruser = await User.findById(foundjob.author);
					employeruser.notifications.push(notification._id);
					employeruser.save();
					res.redirect("/user/" +  req.params.userid + "/offerletter/"  + req.params.jobid);
				}
			    if(req.user.role === "employer"){
					var notification = await Notification.create({"jobid" : foundjob._id});
					notification.save();
					         
					var candidateuser = await User.findById(foundjob.to);
					candidateuser.notifications.push(notification._id);
					candidateuser.save();
					res.redirect("/user/" +  req.user._id + "/employer/offerletter/"  + req.params.jobid);
				}
				
		}catch(err){
			req.flash("error" , err);
			res.redirect("/user/" +  req.params.userid + "/offerletter/"  + req.params.jobid);
		}
	});
});


// schedule interview route
router.post("/interview/:id" , middleware.isLoggedin  , function(req,res){
	 User.findById(req.params.id , function(err , user){
		if(err)
			return console.log(err);
		 
		 // IF employer's organization deatils are not there
		 if(user.organizationdetails.companyname && user.organizationdetails.websiteurl && user.organizationdetails.totalemployees && user.organizationdetails.aboutcompany){
			 
			 var finaldattime = req.body.date + " " + req.body.time;
			 var utcdate = moment.utc(finaldattime , "YYYY-MM-DD HH-mm").format();
			 var datetime = new Date(utcdate);
			// CRAETE JOB OBJECT WITH SUB-FIELDS
			job = {
				position : req.body.position,
				status : "interview-scheduled"
			}

			// CRAETE interview obj
			 interviewobj = {
				 title : req.body.title,
				 date : datetime,
				 status : "interview-scheduled"
			 }

			try{
				// CREATE NEW JOB 
				Job.create(job , function(err , job){
				   if(err)
					return console.log(err);

					// ROLE OF THE USER ACCORDING TO THAT ADD JOB UPDATE JOB SCEHEMA 
					if(user.role === "employer"){
						job.employer = req.params.id;
					}

					if(user.role === "consultant"){
						job.consultant = req.params.id;
					}
					// MAKE JOB AUTHOR AS EMPLOYEE  OR CONSULTANT DEPENDING UPON WHO IS SEND 
					job.author = req.params.id;
					job.save();
					   Interview.create(interviewobj , async function(err , interview){
						   if(err)
							   return console.log(err);

							var user = await User.find({"local.email" : req.body.email});
							   if(user.length === 0){
								user = await User.find({"googleauth.email" : req.body.email});
								if(user.length === 0){
									user = await User.find({"linkedinauth.email" : req.body.email}); 
									}
								}

								 if(user.length > 0){
									 // USER EXIST IN DB SO JUST MAIL THAT USER
									  job.to = user[0]._id;
								 }else{
									 // USER NOT EXIST CREATE NEW USER
									let user = await User.create({"local.email" : req.body.email});
									 user.role = "candidate";
									 user.save();
									 job.to = user._id;
								 }
								 //  SAVE INTERVIEW ID TO JOB OBJECT
								 job.interview.push(interview._id);
								 await job.save();
						   
						         // Generate notification for candidate
						         var notification = await Notification.create({"jobid" : job._id});
								 var candidateuser = await User.findById(job.to);
					             candidateuser.notifications.push(notification._id);
					             candidateuser.save();
								 // SEND EMAIL TO USER WITH FUTHER DETAILS
								
								 let token = await randomBytes(20).toString('hex');
								 job.token = token;
								 await job.save();
								 const accessToken = await oAuth2Client.getAccessToken();
								 let smtpTransport = nodemailer.createTransport({
									host: 'smtp.gmail.com',
									port: 465,
									secure: true,
									service: 'gmail',
									auth : {
											type : "OAUTH2",
											user : process.env.PERSONAL_EMAIL,
											clientId: process.env.GMAIL_GOOGLE_CLIENT_ID,
											clientSecret : process.env.GMAIL_GOOGLE_CLIENT_SECRET,
											refreshToken : process.env.GOOGLE_REDIRECT_URL,
											accessToken : accessToken.token
									}
								});

										
								var mailOptions = {
									to: req.body.email,
									from: process.env.PERSONAL_EMAIL,
									subject: 'Hey you got selected for Interview',
									text: 'Please click the link to be a part of Interview process\n\n' + process.env.WEBSITEURL + '/interviewverify/' + token + '\n\n' 
								};

								smtpTransport.sendMail(mailOptions, function(err){
									if(err){
										req.flash("error" , "Something went wrong. Please trye again.");
										res.redirect("/");
									}else{
										req.flash("success" , "Interview Details are send to " + req.body.email);
										res.redirect('/user/' + req.params.id + "/" + job._id + "/resume");
									}
								});
					   });
				});
			}catch(err){
				req.flash("error" , "Something went wrong");
				res.redirect("/user/" + req.params.id);
			}
			 
		 }else{
			req.flash("error" , "Please update or fill your organizationdetails");
			res.redirect("/user/" + req.user._id);
		 }
	});
});

// next interview router
router.post("/nextinterview/:jobid" , middleware.isLoggedin , function(req , res){
        Job.findById(req.params.jobid).populate("interview").exec(function(err , foundjob){
			if(err)
				return console.log(err);
			
			var finaldattime = req.body.date + " " + req.body.time;
			var utcdate = moment.utc(finaldattime , "YYYY-MM-DD HH-mm").format();
			var datetime = new Date(utcdate);
			var  newinterview = {
			       title : req.body.title,
				   date : datetime,				  
				   status : "interview-scheduled",
		       }  
		    
		    Interview.create(newinterview , async function(err , interview){
				if(err)
					return console.log(err);
			      
			    foundjob.interview.push(interview._id);
				var latestinterview = foundjob.interview[foundjob.interview.length -2];
				latestinterview.status =  "cleared";
				await latestinterview.save();
				foundjob.status = "interview-scheduled";
				foundjob.save();
			    let user  = await User.findById(foundjob.to);
				var useremail = "";
				if(user.local.email){
					useremail = user.local.email;
				 }else if(user.googleauth.email){
					useremail = user.googleauth.email;
				 }else{
					useremail = user.linkedinauth.email;
				 }
				
				// Generate Notification for candidate
				var notification = await Notification.create({"jobid" : foundjob._id});
				var candidateuser = await User.findById(foundjob.to);
				candidateuser.notifications.push(notification._id);
				candidateuser.save();
				
				let sender = await User.findById(foundjob.author);

				
				const accessToken = await oAuth2Client.getAccessToken();
				let smtpTransport = nodemailer.createTransport({
				   host: 'smtp.gmail.com',
				   port: 465,
				   secure: true,
				   service: 'gmail',
				   auth : {
						   type : "OAUTH2",
						   user : process.env.PERSONAL_EMAIL,
						   clientId: process.env.GMAIL_GOOGLE_CLIENT_ID,
						   clientSecret : process.env.GMAIL_GOOGLE_CLIENT_SECRET,
						   refreshToken : process.env.GOOGLE_REDIRECT_URL,
						   accessToken : accessToken.token
				   }
			   });

					   
				var mailOptions = {
					to: useremail,
					from: process.env.PERSONAL_EMAIL,
					subject: 'Hey you got selected for Next Interview',
					text: 'If you want to go on your profile then please click the link below\n\n' + process.env.WEBSITEURL + '/user/' + user._id + '\n\n' 
				};

			   smtpTransport.sendMail(mailOptions, function(err){
					if(err){
						req.flash("error" , "Email is not send something went wrong");
						res.redirect("/user/" + sender._id);
					}else{
						req.flash("success" , "Interview Details are send to " + useremail);
						res.redirect('/user/' + sender._id);
					}
			   });
					});
		});	
});

// Reschedule interview route
router.post("/rescheduleinterview/:jobid" , middleware.isLoggedin , function(req , res){
        Job.findById(req.params.jobid).populate("interview").exec( async function(err , foundjob){
			if(err)
				return console.log(err);
			    
			    foundjob.status  = "rescheduled";
			    await foundjob.save();
			    var finaldattime = req.body.date + " " + req.body.time;
				var utcdate = moment.utc(finaldattime , "YYYY-MM-DD HH-mm").format();
				var datetime = new Date(utcdate);
			
			    var latestinterview = foundjob.interview[foundjob.interview.length - 1];
				latestinterview.title = req.body.title;
			    latestinterview.date = datetime;
			    latestinterview.status = "rescheduled"
			    latestinterview.save();
				

			    let user  = await User.findById(foundjob.to);
				var useremail = "";
				if(user.local.email){
					useremail = user.local.email;
				 }else if(user.googleauth.email){
					useremail = user.googleauth.email;
				 }else{
					useremail = user.linkedinauth.email;
				 }
			    	
			    var notification = await Notification.create({"jobid" : foundjob._id});
				var candidateuser = await User.findById(foundjob.to);
				candidateuser.notifications.push(notification._id);
				candidateuser.save();
				let sender = await User.findById(foundjob.author);


				const accessToken = await oAuth2Client.getAccessToken();
				let smtpTransport = nodemailer.createTransport({
				   host: 'smtp.gmail.com',
				   port: 465,
				   secure: true,
				   service: 'gmail',
				   auth : {
						   type : "OAUTH2",
						   user : process.env.PERSONAL_EMAIL,
						   clientId: process.env.GMAIL_GOOGLE_CLIENT_ID,
						   clientSecret : process.env.GMAIL_GOOGLE_CLIENT_SECRET,
						   refreshToken : process.env.GOOGLE_REDIRECT_URL,
						   accessToken : accessToken.token
				   }
			   });

					   
			   var mailOptions = {
					to: useremail,
					from: process.env.PERSONAL_EMAIL,
					subject: 'Hey you got selected for Next Interview',
					text: 'If you want to go on your profile then please click the link below\n\n' + process.env.WEBSITEURL + '/user/' + user._id + '\n\n' 
				};

			   smtpTransport.sendMail(mailOptions, function(err){
					if(err){
						req.flash("error" , "Email is not send something went wrong");
						res.redirect("/user/" + sender._id);
					}else{
					req.flash("success" , "Interview Details are send to " + useremail);
					res.redirect('/user/' + sender._id);
					}
			   });	
		});	
});


// interview verify token post route
router.get("/interviewverify/:token" , function(req , res){
	Job.find({token : req.params.token} , async function(err , job){
		if(err)
			return console.log(err);
		
		try{
			var user = await User.findById(job[0].to);
	
			 if(user.local.email){
				 // If user is newely created then do this
					if(user.local.emailverified === false){
						user.local.emailverified = true;
						user.save();
						res.render("authentication/unknown-signup.ejs" , {user : user});
					}else{
						// USER IS REGISTERD AS LOCAL STRATEGY
					    req.flash("success" , "Please Login with " + user.local.email + " email address to see your interview schedule");
					    res.redirect("/dashboard/auth/login");
					}	
				}else{
					// GOOGLE AUTH OR LINKEDIN AUTH
					if(user.googleauth.email){
						// USER HAVE GOOGLE ACCOUNT
						req.flash("success" , "Please Login with " + user.googleauth.email + " email address to see your interview schedule");
					    res.redirect("/dashboard/auth/login");
					}else{
						// USER HAVE LINKEDIN ACCOUNT
						req.flash("success" , "Please Login with " + user.linkedinauth.email + " email address to see your interview schedule");
					    res.redirect("/dashboard/auth/login");
					}	
				}
		}catch(err){
			console.log(err);
		}
	});
});


// Reject offerletter from candidate router
router.get("/user/:id/candidatereject/:jobid" , middleware.isLoggedin , async function(req , res){
	if(req.user._id.toString() === req.params.id.toString()){
		try{
			var user = await User.findById(req.params.id); 
			if(user.role === "candidate"){
				var job = await Job.findById(req.params.jobid);
				job.status = "rejected";
				job.save();
				var notification = await Notification.create({"jobid" : job._id});
				notification.save();
				var employeruser = await User.findById(job.author);
				employeruser.notifications.push(notification._id);
				employeruser.save();
				res.redirect("/user/" + req.params.id + "/offerletter/" + req.params.jobid);
			}else{
				req.flash("error" , "You don't have permission do reject other's offer letter.");
				res.redirect("/user/" + req.params.id + "/offerletter/" + req.params.jobid);
			}
		}catch(err){
			req.flash("error" , "Something Went Wrong.");
			res.redirect("/user/" + req.params.id + "/offerletter/" + req.params.jobid);
		}
	}else{
		req.flash("error" , "Something Went Wrong.");
		res.redirect("/user/" + req.params.id + "/offerletter/" + req.params.jobid);
	} 
});


// reject candidate router
router.post("/reject/interview/:jobid" ,middleware.isLoggedin  , function(req,res){
	 Job.findById(req.params.jobid).populate("interview").exec(async function(err , foundjob){
		  if(err)
			  return console.log(err);
		 
		       var latestinterview = foundjob.interview[foundjob.interview.length - 1];
			   latestinterview.status = "rejected";
			   latestinterview.rejectcomment = req.body.comment;
		       await latestinterview.save();
			   foundjob.status = "rejected";
			   foundjob.save();
			   res.redirect("/user/" + req.user._id);
		  
	 });
});

// User is Joined on time
router.get("/user/:employerid/:jobid/joined" , middleware.isLoggedin , async function(req ,res){
	try{
		var employer = await User.findById(req.params.employerid);
		var jobobj = await Job.findById(req.params.jobid).populate("to offerletter");
		jobobj.status = "joined";
		jobobj.joiningdate = Date.now();
		await jobobj.save();
		var notification = await Notification.create({"jobid" : jobobj._id});
		notification.save();
		var candidteuser = await User.findById(jobobj.to);
		candidteuser.notifications.push(notification._id);
		candidteuser.save();
		res.redirect("/user/" + req.user._id + "/employer/offerletter/" + req.params.jobid);
	}catch(err){
		req.flash("error" , "Something Went Wrong");
		res.redirect("/user/" + req.user._id + "/employer/offerletter/" + req.params.jobid);
	}
});


// Withdraw Offer Letter through Candidate
router.post("/withdraw/:jobid" , middleware.isLoggedin , async function(req ,res){
	  try{
		  var jobobj = await Job.findById(req.params.jobid).populate("offerletter");
		  var offerletterobj = jobobj.offerletter;
		  offerletterobj.withdrawcomment = req.body.comment;
		  await offerletterobj.save();
		  jobobj.status = "withdrawn";
		  jobobj.save();
		  
		  // Delete Notification from candidate Notification array
		  var candidateuser = await User.findById(jobobj.to).populate("notifications");
		  for(var i = 0 ; i < candidateuser.notifications.length ; i++){
			  if(candidateuser.notifications[i].jobid.toString() === jobobj._id.toString()){
				  candidateuser.notifications.splice(i, 1);
				  console.log("found that");
				  await candidateuser.save();
			  }
		  }
		  
		   res.redirect("/user/" + req.user._id + "/employer/offerletter/" + req.params.jobid);
		  
	  }catch(err){
		  req.flash("error" , "Something Went Wrong");
		  res.redirect("/user/" + req.user._id + "/employer/offerletter/" + req.params.jobid);
	  }
});




// UPLOAD IMAGE TO CLOUDINARY.COM SENDING OBJECT..
function upload_get_url(image){
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(image , {exif : true} , (err, url) => {
      if (err) return reject(err);
      return resolve(url);
    });
  });
}


module.exports = router;