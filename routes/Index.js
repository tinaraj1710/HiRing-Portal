var  router            =    require("express").Router(),
	 passport          =    require("passport"),
	 bcrypt            =    require("bcrypt"),
	 User              =    require("../models/user"),
	 Notification      =    require("../models/notification"),
	 Profdata          = 	require("../models/resume/professionaldata.js"),
	 Education         =    require("../models/resume/education.js"),
	 Workexp    	   =    require("../models/resume/workexp.js"),
	 Award             =    require("../models/resume/award.js"),
	 Other             =     require("../models/resume/other.js"),
     Project           =    require("../models/resume/project.js"),
	 Job               =    require("../models/job/job"),
	 nodemailer        =    require("nodemailer"),
	 middleware        =    require("../middleware");


const { compose } = require("async");
const { randomBytes } = require('crypto');

// Google Oauth Setup ====================================
const { google }  = require("googleapis");

const oAuth2Client  = new google.auth.OAuth2(
	process.env.GMAIL_GOOGLE_CLIENT_ID, 
	process.env.GMAIL_GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URL
)

oAuth2Client.setCredentials({ refresh_token : process.env.GOOGLE_REFRESH_TOKEN });
// =======================================================


// HOME PAGE
router.get("/" , function(req,res){
	res.render("authentication/register.ejs");
});


// HOME PAGE
router.get("/dashboard" , function(req, res){
	res.render("authentication/register.ejs");
});


// All Authencation routes (Local Login) ================================
// LOGIN ROUTE 
router.get("/dashboard/auth/login", middleware.alreadyLoggedin   , function(req, res){
	res.render("authentication/login.ejs");
});


// LOGIN POST REQUEST ===
router.post('/dashboard/auth/login', passport.authenticate('local', { 
	failureRedirect: '/dashboard/auth/login',
	failureFlash: 'Invalid username or password.'}), function(req, res) {
	
	req.flash("success" , "Welcome " + req.user.local.firstname + " " + req.user.local.lastname);
	if(req.user.role === "employer"){
		if(req.user.organizationdetails.companyname && req.user.organizationdetails.websiteurl && req.user.organizationdetails.totalemployees && req.user.organizationdetails.aboutcompany){
			res.redirect('/user/' + req.user._id);
		}else{
			res.redirect('/user/' + req.user._id + "/employer/profile");
		}
	}else{
		res.redirect('/user/' + req.user._id);
	}
});



// REGISTER ROUTE
router.get("/dashboard/register" , middleware.alreadyLoggedin ,  function(req,  res){
	res.render("authentication/register.ejs");
});


// REGISTER USER USING LOCAL STRATEGY
router.post("/dashboard/register" , async function(req,res){
	// REGISTER USER
	if(req.body.confpass === req.body.password){
		try {
			var hashedpass = await bcrypt.hash(req.body.password , 10);
			let founduser = await User.findOne({"local.email" : req.body.email});
			if(founduser){
				req.flash("error" , "User with this Email Address already exist");
				return res.redirect("/dashboard/register"); 
			}

			let createduser = await User.create({
				"local.email" : req.body.email,
				"local.password" : hashedpass,
				"local.firstname" : req.body.firstname,
				"local.lastname" : req.body.lastname,
			});

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
			createduser.local.verifyEmailToken = token;
			await createduser.save();

			var mailOptions = {
				to: createduser.local.email,
				from: process.env.PERSONAL_EMAIL,
				subject: 'Employee Project verify Email Address',
				text: 'Please click on the following link to verify you email address, or paste this into your browser to complete the process:\n\n' + process.env.WEBSITEURL + '/verify/' + token + '\n\n' +
				'If you did not request this, please ignore this email \n'
			};

			smtpTransport.sendMail(mailOptions, function(err) {
				if(err){
					req.flash("error" , "Something went wrong");
					res.redirect("/");
				}

				req.flash("success" , "An verification email has been send to " + createduser.local.email + " with the futher Instructions to verify your Email.");
				res.redirect('/dashboard/register/');
			});
	    }catch(err){
			console.log(err);
			req.flash("error" , err.message);
			res.redirect("/dashboard/register");
		}
	}else{
		req.flash("error" , "Your password and confirm password does not match");
		res.redirect("/dashboard/register");
	}
}); 



// VERIFY EMAIL ADDRESS SECTION  === 
router.get("/verify/:token" , async function(req,res){
	try{
		let user = await User.findOne({"local.verifyEmailToken" : req.params.token});
		user.local.emailverified = true;
		await user.save();
		req.flash("Your Email verification is done");
		req.login(user , function(err){
			if(err){
				return console.log(err);
			}

			req.flash("success" , "Please select appropriate role");
			res.redirect("/user/" + req.user._id + "/selectrole");
		});

	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/dashboard/register");
	}
});




// Role selector of local login system
router.get("/user/:id/selectrole" , middleware.isLoggedin , async function(req , res){
	try{
		var user = await User.findById(req.params.id);
		if(user){
			res.render("authentication/index.ejs");
		}else{
			req.flash("error" , "Something went wrong");
			res.redirect("/dashboard/register");
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/dashboard/register");
	}
});


// Role selector of local login system
router.get("/user/:id/registerrole/:role" , middleware.isLoggedin, async function(req , res){
	if(req.params.role === "candidate" || req.params.role === "employer" || req.params.role === "consultant"){
		try{
			var user = await User.findById(req.params.id);
			user.role = req.params.role;
			await user.save();
			// Get Full name of user
			var fullname = "";
			if(user.local.firstname){
			    fullname = user.local.firstname + " " + user.local.lastname; 
			}else if(user.googleauth.fullname){
			    fullname = user.googleauth.fullname;
			}else{
			    fullname = user.linkedinauth.fullname;
			}
			req.flash("success" , "Welcome " + fullname);
			console.log(" ===> " + req.user);
			if(req.user.role === "employer"){
			    if(req.user.organizationdetails.companyname && req.user.organizationdetails.websiteurl 
				       && req.user.organizationdetails.totalemployees && req.user.organizationdetails.aboutcompany){
					   res.redirect('/user/' + req.user._id);
				}else{
					res.redirect('/user/' + req.user._id + "/employer/profile");
				}
			}else{
				res.redirect('/user/' + req.user._id);
			}
		}catch(err){
			console.log(err);
			req.flash("error" , err.message);
		    res.redirect("/user/"  + req.user._id + "/selectrole");
		}
	}else{
		req.flash("error" , "Please select the correct role that is given in the option");
		res.redirect("/user/"  + req.user._id + "/selectrole");
	}
});



// RESET PASSWORD SESSION 
router.get("/dashboard/forgot" , function(req , res){
	res.render("authentication/forgot.ejs");
});


// POST TO FORGOT ROUTE
router.post('/dashboard/forgot', async function(req, res, next) {
	 try{
		    let token = await randomBytes(20).toString('hex');
		    let user = await User.findOne({ "local.email": req.body.email });
			if(!user){
				req.flash("error", "No account with that email address exists.");
				return res.redirect("/dashboard/forgot");
			}

			user.local.resetPasswordToken = token;
			user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour
			await user.save();

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
				to: user.local.email,
				from: process.env.PERSONAL_EMAIL,
				subject: 'Employee Project Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' + process.env.WEBSITEURL + 
					'/reset/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};

			smtpTransport.sendMail(mailOptions, function(err) {
				if(err){
						req.flash("error" , "Something went wrong, please try again.");
						res.redirect("/dashboard/forgot");
				}else{
					console.log("Password reset was successful");
					req.flash("success" , "An Email has been send to " + req.body.email +   " with the futher instructions to reset your password.");
					res.redirect("/dashboard/forgot");
				}
			});
	 }catch(err){
		 req.flash("error" , "Something went wrong while doing password reset. Please try again.");
		 res.redirect("/dashboard/forgot");
	 }    
});



// Reset password token link route
router.get('/reset/:token', async function(req, res) {
	try{
		let user = await User.findOne({ "local.resetPasswordToken": req.params.token, "local.resetPasswordExpires": { $gt: Date.now() } });
		if (!user) {
			req.flash("error", "Password reset token is invalid or has expired.");
			return res.redirect('/dashboard/forgot');
		}

		res.render("authentication/reset.ejs", {token: req.params.token});

	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect('/dashboard/forgot');
	}
});



// Reset password token verification route
router.post('/reset/:token', async function(req, res) {
	try{
		let user = await User.findOne({ "local.resetPasswordToken": req.params.token, "local.resetPasswordExpires": { $gt: Date.now() } });
		if (!user) {
			req.flash("error", "Password reset token is invalid or has expired.");
			return res.redirect('back');
		}

		if(req.body.password === req.body.confpassword) {
			var hashedpass = await bcrypt.hash(req.body.password , 10);
			user.local.password = hashedpass;
			user.local.resetPasswordToken = undefined;
			user.local.resetPasswordExpires = undefined;
			await user.save();
			req.login(user , async function(err , user) {
				if(err){
					req.flash("error" , "Something went wrong while loggin the user. Please try again");
					res.redirect('back');
				}

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
					to: req.user.local.email,
					from: process.env.PERSONAL_EMAIL,
					subject: 'Your password has been changed',
					text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + req.user.local.email + ' has just been changed.\n'
				};

				smtpTransport.sendMail(mailOptions, function(err) {
					if(err){
						req.flash("error", "Something went wrong. please try again.");
						res.redirect("dashboard/forgot");
					}

					req.flash("success", "Your password has been changed.");
					res.redirect('/user/' + req.user._id);
				});

			});
		}else{
			req.flash("error", "Passwords do not match.");
			return res.redirect('back');
		}

	}catch(err){
		req.flash("error" , err.message);
		res.redirect("/reset/" + req.params.token);
	}  
});


// LOGOUT ROUTE 
router.get("/dashboard/auth/logout" , function(req,res){
	 req.logout();
	 res.redirect("/dashboard");
});
// ===========================================================





//  Candidates Routes ========================================
// USER'S PROFILE PAGE
router.get("/user/:id" , middleware.isLoggedin , async function(req , res){
	// FIND DATA OF USER AND SEND THEM ON PROFILE PAGE
	try{
		let user = await User.findById(req.params.id);
		if(user.role === "candidate"){
			var jobobj = await Job.find({"to" : req.params.id}).populate("author interview offerletter");
			var accepted = [];
			var rejected = [];
			var defaulted = [];
			var alljobs = [];
			var candidateofferletters = [];
			var candidateinterviews = [];
			var candidateupcominginterviews = [];
            for(var job of jobobj){
				if(job.offerletter){
					if(job.status === "offerletter-sent"){
						 await candidateofferletters.push(job);
					}
				}
				
				if(job.interview && !job.offerletter){
					var latinterview = job.interview[job.interview.length -1];
					if(latinterview.status === "interview-scheduled" || latinterview.status === "rescheduled"){
						var todaysdate = new Date().getTime();
						if(todaysdate > latinterview.date.getTime()){
							await candidateinterviews.push(job);
						}else{
							await candidateupcominginterviews.push(job);
						}
					}
				}


				if(job.status === "accepted"){
					await accepted.push(job);
				}

				if(job.status === "rejected"){
					await rejected.push(job);
				}

				if(job.status === "defaulted"){
					await defaulted.push(job);
				}
				
				if(job.status != "withdrawn"){
					await alljobs.push(job);
				}
			}
			await middleware.offerlettersortde(candidateofferletters);
			await middleware.jobsortde(candidateupcominginterviews);
			res.render("Dashboard.ejs" , { 
				alljobs : alljobs, 
				candidateofferletters  : candidateofferletters, 
				candidateinterviews : candidateinterviews,
				acceptedarr : accepted,
				defaultedarr : defaulted,
				rejectedarr : rejected,
				upcominginterviews : candidateupcominginterviews,
			});
		}
		
		if(user.role === "employer" || user.role === "consultant"){
			var jobobj = await Job.find({"author" : req.params.id}).populate("to offerletter interview author");
			var pendingofferletters = [];
			var todaysinterviews = [];
			var upcominginterviews = [];
            for(var job of jobobj){
				if(job.offerletter){
					// Check for offerletter expiry
					if(job.status === "offerletter-sent"){
						 var date = new Date(Date.now());
					     if(job.offerletter.expiring.getTime() < date.getTime()){
							await pendingofferletters.push(job);
						 } 
					}
				}
				if(job.interview.length > 0 && !job.offerletter){
					
					if(job.status === "interview-scheduled" || job.status === "rescheduled"){
						// Check for today's interview 
						var date2 = new Date(Date.now());
						if(job.interview[job.interview.length - 1].date.toDateString() === date2.toDateString()){
							await todaysinterviews.push(job);
						}
						// Check for Upcoming interview 
						if(job.interview[job.interview.length -1].date.getTime() > date2.getTime()){
							await upcominginterviews.push(job);
						}
					}
				}
			}
			
			await middleware.jobsortas(todaysinterviews);
			await middleware.jobsortas(upcominginterviews);
			await middleware.offerlettersortde(pendingofferletters);
			res.render("Dashboard.ejs" , {todaysinterviews : todaysinterviews , upcominginterviews : upcominginterviews , pendingofferletters : pendingofferletters});
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
});



// Offer letter page of candidate
router.get("/user/:id/offerletter" , middleware.isLoggedin , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		if(user.role === "candidate"){
			var alljobs = await Job.find({"to"  : req.params.id}).populate("employer author interview offerletter");
			 var offerletter = [];
			 for(var job of alljobs){
				 if(job.offerletter){
					 if(job.status !== "withdrawn"){
						  await offerletter.push(job);
					 }
				 }  
			 }
			 await middleware.offerlettersortde(offerletter);
			 var results = await middleware.pagination(offerletter , req.query.page , req.query.limit);
			 res.render("candidate/offerletter.ejs" , {paginateddata : results});
	   }else{
		   req.flash("error" , "Something went wrong");
		   res.redirect("/user/" + req.params.id);
	   }  
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/" + req.params.id);
	} 
});



// Api for offerletter page of candidate
router.get("/api/user/:id/offerletter" , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		if(!user){
            return res.status(500).send("User not found");
		}
		var alljobs = await Job.find({"to"  : req.params.id}).populate("author interview offerletter to");
		var offerletter = [];
		for(var job of alljobs){
			if(job.offerletter){
				if(job.status !== "withdrawn"){
					await offerletter.push(job);
				}
			}  
		}
		await middleware.offerlettersortde(offerletter);
		res.json(offerletter);

	}catch(err){
		console.log(err);
		return err.message;
	}
});



// Each offerletter page of candidate
router.get("/user/:id/offerletter/:jobid" , middleware.isLoggedin ,async function(req , res){
	try{
		// Check user is loggedin and ensureCorrectUser ==
		if(req.params.id.toString() === req.user._id.toString()){
			// find job by their id
			 var job = await Job.findById(req.params.jobid).populate("offerletter to author");
			 var sender = job.author;
			 var reciever = job.to;
			 res.render("candidate/each-offerletter.ejs" , {sender : sender , reciever : reciever , offerletter : job})
			
		}else{
			req.flash("error" , "You don't have permission to check others offerletter");
			res.redirect("/user/" + req.params.id + "/offerletter");
		}	
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/" + req.params.id + "/offerletter");
	} 
});



// Each Interview page of candidate
router.get("/user/:id/interview/:jobid" , middleware.isLoggedin ,async function(req , res){
	try{
		if(req.params.id.toString() === req.user._id.toString()){
			// find job by their id
			 var job = await Job.findById(req.params.jobid).populate("to author interview");
			 var sender = job.author;
			 var reciever = job.to;
			 var interviews = job.interview;
			 res.render("candidate/each-interview.ejs" , {sender : sender , reciever : reciever , interviews : interviews , jobobj : job});
		}else{
			req.flash("error" , "You don't have permission to check others Interview Details");
			res.redirect("/user/" + req.params.id + "/interviews");
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/" + req.params.id + "/interviews");
	}
});



// Interview page of candidate
router.get("/user/:id/interviews", middleware.isLoggedin, async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		if(!user){
			req.flash("error" , "User not found");
			res.redirect("back");
		}
		var alljobs = await Job.find({"to"  : req.params.id}).populate("employer author interview offerletter");
		var interviews = [];
		for(var job of alljobs){
			if(job.interview && !job.offerletter){
				await interviews.push(job);
			}
		}
		
		await middleware.jobsortde(interviews);
		var results = await middleware.pagination(interviews , req.query.page , req.query.limit);
		res.render("candidate/interviews.ejs" , {paginateddata : results});

	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
});


//Api for Interview page of candidate ============= 
router.get("/api/user/:id/interviews" , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		if(!user){
			return res.status(500).send("User not found");
		}

	    var alljobs = await Job.find({"to"  : req.params.id}).populate("author interview offerletter to");
		var interviews = [];
		for(var job of alljobs){
			if(job.interview && !job.offerletter){
				await interviews.push(job);
			}
		}
		
		await middleware.jobsortde(interviews);
		res.json(interviews);
	}catch(err){
		console.log(err);
		return res.status(500).send("Something went wrong");

	}
});


// Remove this route ================================>>>>>>>> 
// My Application page of candidate
router.get("/user/:id/myapplication" , middleware.isLoggedin , function(req,res){
	  User.findById(req.params.id , async function(err , user){
		  if(err)
			  return console.log(err);
		  
		     var alljobs = await Job.find({"to"  : req.params.id}).populate("employer author interview offerletter");
		     var sendarray  = [];
			   for(var i = 0  ; i < alljobs.length ; i++){
				   // Check for Offer letter
					if(alljobs[i].offerletter){
						var num = alljobs[i].offerletter.expiring.getTime();
						await sendarray.push(num);
					}
				    
				    // Check for Interview process
					if(!alljobs[i].offerletter && alljobs[i].interview[alljobs[i].interview.length - 1].date.getTime()){
						var num = alljobs[i].interview[alljobs[i].interview.length - 1 ].date.getTime();
						await sendarray.push(num);
					} 
			   }
			  var oldone = await sendarray;
			  var finalarray  = [];
			  var sortednum = await middleware.sortallde(sendarray);
			  for(var i = 0  ; i < sortednum.length ; i++){
				  // Do the reverse process
				  for(var j = 0 ; j < sortednum.length ; j++){
					  if(alljobs[j].offerletter){
						  if(alljobs[j].offerletter.expiring.getTime() === sortednum[i]){
							  await finalarray.push(alljobs[j]);
						  }
					  }
					  
					  if(alljobs[j].interview.length > 0){
						  if(sortednum[i] === alljobs[j].interview[alljobs[j].interview.length -1].date.getTime()){
							  await finalarray.push(alljobs[j]);
						  }
					  }
				  }
			   }
		  res.render("candidate/myapplication.ejs" , {alljobs :  finalarray});
	  });
});




// Candidate profile page 
// Convert this round into async and await ================
router.get("/user/:id/profile" , middleware.isLoggedin ,  function(req , res){
	// FIND USER AND SEND DATA TO  PROFILE PAGE
	if(req.params.id.toString() ===  req.user._id.toString()){
		User.findById(req.params.id , async function(err , founduser){
			if(err)
				return console.log(err);
			 
			 if(founduser.role === "candidate"){
				 var profdata = await Profdata.find({"author.id" : req.params.id});
				 res.render("candidate/profile.ejs" , {user : founduser , profdata : profdata});
			 }else{
				 req.flash("error" , "Something went wrong");
				 res.redirect("/user/" + req.user._id);
			 } 
		});
	}else{
		req.flash("error" , "You don't have permission do change profile data");
		res.redirect("/user/" + req.user._id);
	}
		
});
// ===========================================================



// UPDATE PROFILE PAGE OF CANDIDATE
router.post("/user/:id/profile" , middleware.isLoggedin ,  async function(req ,res){
	try{
		var currentuser  =  req.params.id;
		if(req.params.id.toString() ===  req.user._id.toString()){
			let user = await User.findById(req.params.id);
			if(user.role === "candidate"){
				var personaldata  =  user.personaldetails;
				personaldata.DOB = req.body.DOB;
				personaldata.gender = req.body.gender;
				personaldata.Paddress = req.body.paddress;
				personaldata.city = req.body.city;
				personaldata.state = req.body.state;
				personaldata.country = req.body.country;
				personaldata.zipcode = req.body.zipcode;
				personaldata.contnum = req.body.cont1;
				personaldata.Altcontnum = req.body.cont2;
				user.save();
				res.redirect("/user/" + req.user._id + "/profile");
			}else{
				req.flash("error" , "Something went wrong while updating your profile details.");
				res.redirect("/user/" + req.user._id);
			}
		}else{
			req.flash("error" , "You don't have permission do change profile data");
			res.redirect("/user/" + currentuser + "/profile");
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
});



// Profile page update Name ===
router.post("/user/:id/profile/name" , middleware.isLoggedin , async function(req , res){
	try{
		if(req.params.id.toString() ===  req.user._id.toString()){
			// Find user from DB
			let datafullname = req.body.fullname.trim();
			var ansarr = datafullname.split(" ");
			ansarr = ansarr.filter(data => data.length > 0);
			if(ansarr.length > 0){
				var user = await User.findById(req.params.id);
				if(user.local.firstname){
					if(ansarr.length == 1){
						user.local.firstname = ansarr[0];
					}

					if(ansarr.length >= 2){
						var firstname = ansarr[0];
						var lastname = "";
						for(var i = 1; i < ansarr.length; i++){
							if(i == ansarr.length - 2){
								firstname = firstname + ansarr[i];
								continue;
							}
							if(i == ansarr.length -1){
								lastname = ansarr[i];
								continue;
							}
							firstname = firstname + " " + ansarr[i];
						}

						user.local.firstname = firstname;
						user.local.lastname = lastname;
					}
				}else if(user.googleauth.fullname){
					 user.googleauth.fullname = datafullname;
				 }else{
					  user.linkedinauth.fullname = datafullname;
				 }
				 user.save();
				 res.redirect("/user/" + req.user._id+ "/profile");
			}else{
				req.flash("error" , "Please provide Name.");
				res.redirect("/user/" + req.user._id+ "/profile");
			}
		}else{
		   req.flash("error" , "You don't have permission do change profile data");
		   res.redirect("/user/" + req.user._id + "/profile");
	    }

	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/" + req.user._id + "/profile");
	}
});

router.post("/user/:id/profile/position" , middleware.isLoggedin , async function(req, res){
	 if(req.params.id.toString() ===  req.user._id.toString()){
	     if(req.body.position.length > 0){
			  // Create Profdata  and save them
			var profdata = await Profdata.find({"author.id" : req.params.id});
			 if(profdata.length > 0){
				   profdata[0].position = req.body.position;
				   profdata[0].save();
			 }else{
				  Profdata.create({ position : req.body.position } , function(err , profdata){
				  if(err)
					  return console.log(err);
				   
				      profdata.author.id = req.params.id;
				      profdata.save();
			     });
			 }
			  
			  res.redirect("/user/" + req.user._id + "/profile");
		 }else{
			  req.flash("error" , "Please provide position."); 
		      res.redirect("/user/" + req.user._id + "/profile");
		 }
	 }else{
		   req.flash("error" , "You don't have permission do change profile data");
		   res.redirect("/user/" + req.user._id + "/profile");
	 }
});




// Mark notification as true of offerletter
router.get("/user/:id/notification/offerletter/:notificationid" , middleware.isLoggedin , async function(req , res){
	try{
		var notification = await Notification.findById(req.params.notificationid);
		notification.isRead = true;
		await notification.save();
		if(req.user.role === "candidate"){
			res.redirect("/user/" + req.user._id + "/offerletter/" + notification.jobid._id);
		}
		if(req.user.role === "employer"){
			res.redirect("/user/" + req.user._id + "/employer/offerletter/" + notification.jobid._id);
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	} 
});




// Mark notification as true of Interview
router.get("/user/:id/notification/interview/:notificationid" , middleware.isLoggedin , async function(req , res){
	try{
		var notification = await Notification.findById(req.params.notificationid);
		notification.isRead = true;
		await notification.save();
		if(req.user.role === "candidate"){
			res.redirect("/user/" + req.user._id + "/interview/" + notification.jobid._id);
		}
		if(req.user.role === "employer"){
			res.redirect("/user/" + req.user._id + "/" + notification.jobid._id + "/resume");
		}
	} catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
});



// =========================================================

// Employer Routes ==================================

// Candidates page of employer
router.get("/user/:id/employer/candidates" , middleware.isLoggedin , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		if(user.role === "employer"){
			var alljobs = await Job.find({"author"  : req.params.id}).populate("employer to interview offerletter");
			var sendarray  = [];
			for(var i = 0  ; i < alljobs.length ; i++){
				// Check for Offer letter
				 if(alljobs[i].offerletter){
					 var obj = {};
					 obj.num = alljobs[i].offerletter.expiring.getTime();
					 obj._id = alljobs[i]._id;
					 await sendarray.push(obj);
				 }
				 
				 // Check for Interview process
				 if(!alljobs[i].offerletter && alljobs[i].interview.length > 0){
					 var obj = {};
					 obj.num = alljobs[i].interview[alljobs[i].interview.length - 1 ].date.getTime();
					 obj._id = alljobs[i]._id;
					 await sendarray.push(obj);
				 } 
			}
		 
		   var finalarray  = [];
		   var sortednum = await middleware.sortallde(sendarray);
		   for(var i = 0  ; i < sortednum.length ; i++){
			   // Do the reverse process
			   for(var j = 0 ; j < sortednum.length ; j++){
				   if(alljobs[j]._id === sortednum[i]._id){
					   await finalarray.push(alljobs[j]);
					   break;
				   }
			   }
			}
			
		   var results = await middleware.pagination(finalarray , req.query.page , req.query.limit);
		   res.render("employer/candidates.ejs" , {paginateddata : results});
		}else{
			req.flash("error" , "You don't have permission to do this");
			res.redirect("/user/" + req.params._id);
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/" + req.params._id);
	}
});



// APi for candidates page of employer
router.get("/api/user/:id/employer/candidates"  ,async function(req,res){
	  try{
		    let user = await User.findById(req.params.id);
            var alljobs = await Job.find({"author"  : req.params.id}).populate("employer to interview offerletter");
			var sendarray  = [];
			for(var i = 0  ; i < alljobs.length ; i++){
				// Check for Offer letter
				if(alljobs[i].offerletter){
					var obj = {};
					obj.num = alljobs[i].offerletter.expiring.getTime();
					obj._id = alljobs[i]._id;
					await sendarray.push(obj);
				}
				
				// Check for Interview process
				if(!alljobs[i].offerletter && alljobs[i].interview.length > 0){
					var obj = {};
					obj.num = alljobs[i].interview[alljobs[i].interview.length - 1 ].date.getTime();
					obj._id = alljobs[i]._id;
					await sendarray.push(obj);
				} 
			}
		
			var finalarray  = [];
			var sortednum = await middleware.sortallde(sendarray);
			for(var i = 0  ; i < sortednum.length ; i++){
				// Do the reverse process
				for(var j = 0 ; j < sortednum.length ; j++){
					if(alljobs[j]._id === sortednum[i]._id){
						await finalarray.push(alljobs[j]);
						break;
					}
				}
			}
			
			return res.json(finalarray);
	  }catch(err){
		  console.log(err);
		  return res.status(500).send(err.message);
	  }
});



// offerletter page of employer
router.get("/user/:id/employer/offerletter" , middleware.isLoggedin , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		if(user.role === "employer"){
			var alljobs = await Job.find({"author"  : req.params.id}).populate("employer to interview offerletter");
			var offerletter = [];
			for(var job of alljobs){
			if(job.offerletter){
				await offerletter.push(job);
				}  
			}
			await middleware.offerlettersortde(offerletter);
				
			var results = await middleware.pagination(offerletter , req.query.page , req.query.limit);
			res.render("employer/offerletter.ejs" , { paginateddata : results}); 
		}else{
			req.flash("error" , "You don't have permission to do this");
			res.redirect("/user/" + req.user._id);
		}

	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/" + req.user._id);
	}
});



// Api for offerletter of employer
router.get("/api/user/:id/employer/offerletter" , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		var alljobs = await Job.find({"author"  : req.params.id}).populate("employer to interview offerletter author");
		var offerletter = [];
		for(var job of alljobs){
			if(job.offerletter){
				await offerletter.push(job);
				}  
			}
		await middleware.offerlettersortde(offerletter);
		return res.json(offerletter);
	}catch(err){
		console.log(err);
		return res.status(500).send(err.message);
	}
});




// Send offerletter page of each candidates
router.get("/user/:employerid/candidate/:jobid" , middleware.isLoggedin , async function(req , res){
	if(req.params.employerid.toString() === req.user._id.toString()){
	    // Find employer and candidate 
		try{
			var jobobj = await Job.findById(req.params.jobid).populate("author to interview");
			if(jobobj.interview.length > 0){
				// Interview obj is not rejected
				
				if(jobobj.interview[jobobj.interview.length -1].status === "interview-scheduled" ||
				  jobobj.interview[jobobj.interview.length -1].status === "rescheduled"){
					// Only interviews are allowed
					
					var employer  = await User.findById(req.params.employerid);
					var candidate = await User.findById(jobobj.to._id);
					var totaloffletterofcandidate = await Job.find({"to" : candidate._id});
					var totaldefaulted = 0;
					
					for(var job of totaloffletterofcandidate){
						if(job.status === "defaulted"){
							totaldefaulted = totaldefaulted  + 1;
						}
					}

					var profdata = await Profdata.find({"author.id" : candidate._id});
					res.render("employer/sendofferletter.ejs" , {employer : employer , candidate : candidate , profdata : profdata , job : jobobj , totaldefaulted : totaldefaulted });
				}else{
					req.flash("error" , "Candidate is already rejected. Now you can not send offerletter to them.");
					res.redirect("/user/" + req.user._id + "/" + jobobj._id + "/resume");
				}
			}
			
		}catch(err){
			req.flash("error" , "Something went wrong");
			res.redirect("/user/" + req.user._id);
		}
		
	}else{
		req.flash("error"  , "You don't have permission to see this page");
		res.redirect("/user/" + req.user._id);
	}
});



// Employer ==  See offerletter page of each candidate 
router.get("/user/:id/employer/offerletter/:jobid" , middleware.isLoggedin ,async function(req , res){
	try{
		if(req.params.id.toString() === req.user._id.toString()){
			// find job by their id
			var job = await Job.findById(req.params.jobid).populate("offerletter to author");
			var sender = job.author;
			var reciever = job.to;
			var profdata = await Profdata.find({"author.id" : reciever._id});
			res.render("employer/each-offerletter.ejs" , {sender : sender , reciever : reciever , job : job , profdata : profdata});
		   
	   }else{
		   req.flash("error" , "You don't have permission to check others offerletter");
		   res.redirect("/user/" + req.params.id + "/offerletter");
	   }	
	}catch(err){
       console.log(err);
	   req.flash("error" , err.message);
	   res.redirect("back");
	}
});



// Interview page of Employer
router.get("/user/:id/employer/interviews" , middleware.isLoggedin , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		if(user.role === "employer"){
			var alljobs = await Job.find({"author"  : req.params.id}).populate("employer interview offerletter to");
			var interviews = [];
			for(var job of alljobs){
				if(job.interview && !job.offerletter){
					if(job.interview[job.interview.length - 1].status === "interview-scheduled" || 
					   job.interview[job.interview.length - 1].status === "rescheduled" ){
						await interviews.push(job);
					}
				  }
			 }
			  
			   await middleware.jobsortde(interviews);
			   var results = await middleware.pagination(interviews , req.query.page , req.query.limit);
			   res.render("employer/interviews.ejs" , {paginateddata : results});
		  
		}else{
			  req.flash("error" , "You don't have permission to to do that");
			  rea.redirect("/user/" + req.params.id);
		}	
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
});




// Api for interview page of employer ======
router.get("/api/user/:id/employer/interviews" , middleware.isLoggedin , async function(req,res){
	try{
		let user = await User.findById(req.params.id);
		var alljobs = await Job.find({"author"  : req.params.id}).populate("employer interview offerletter to author");
		  var interviews = [];
		  for(var job of alljobs){
			  if(job.interview && !job.offerletter){
				  if(job.interview[job.interview.length - 1].status === "interview-scheduled" || 
					 job.interview[job.interview.length - 1].status === "rescheduled" ){
					     await interviews.push(job);
				  }
				}
		   }
		    
		await middleware.jobsortde(interviews);
		return res.json(interviews);
	}catch(err){
		console.log(err);
		return res.status(500).send(err.message);
	}
});




// RESUME PAGE
router.get("/user/:employerid/:jobid/resume" , middleware.isLoggedin , async function(req , res){
	try{
		var jobobj = await Job.findById(req.params.jobid).populate("offerletter interview to author");
		var candidate = jobobj.to;
	    var totaloffletterofcandidate = await Job.find({"to" : candidate._id});
	    var totaldefaulted = 0;
	    for(var job of totaloffletterofcandidate){
			if(job.status === "defaulted"){
				totaldefaulted = totaldefaulted  + 1;
			}
		}
		var employer = jobobj.author;
		var profdata   = await  Profdata.find({"author.id" : candidate._id});
		var workexps   =  await Workexp.find({"author.id" : candidate._id});
		var educations = await Education.find({"author.id" : candidate._id});
		var projects   = await Project.find({"author.id" : candidate._id});
		var awards     = await Award.find({"author.id" : candidate._id});
		var othersdata   = await Other.find({"author.id" : candidate._id});
	    res.render("employer/candidate-resume.ejs" , {profdata : profdata , workexps : workexps , educations : educations  , awards : awards , projects : projects  , othersdata  : othersdata , user : candidate , employer : employer , job : jobobj , totaldefault : totaldefaulted});

	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}  
	
});



// Employee profile page 
router.get("/user/:id/employer/profile" , middleware.isLoggedin , async function(req , res){
	try{
		let user = await User.findById(req.params.id);
		if(user.role === "employer"){
			res.render("employer/profile.ejs" , {user  : user});
		}else{
			req.flash("error" , "Something went wrong");
			res.redirect("/user/" + req.params.id);
		}
	}catch(err){
		console.log(err);

	}
});

// Employer update profile data route
router.post("/user/:id/employer/profile" , middleware.isLoggedin , function(req,res){
	if(req.user._id.toString() === req.user._id.toString()){
		User.findById(req.params.id ,  function(err ,user){
			if(err)
				return console.log(err);
			
			var personaldata  =  user.personaldetails;
			personaldata.DOB = req.body.DOB;
			personaldata.gender = req.body.gender;
			personaldata.Paddress = req.body.paddress;
			personaldata.city = req.body.city;
			personaldata.state = req.body.state;
			personaldata.country = req.body.country;
			personaldata.zipcode = req.body.zipcode;
			personaldata.contnum = req.body.cont1;
			personaldata.Altcontnum = req.body.cont2;
			var organizationdetails = user.organizationdetails;
			organizationdetails.companyname = req.body.companyname;
			organizationdetails.websiteurl = req.body.websiteurl;
			organizationdetails.totalemployees = req.body.totalemployee;
			organizationdetails.aboutcompany = req.body.aboutcompany;
			user.save();
			res.redirect("/user/" + req.user._id + "/employer/profile");
		});
	}else{
		req.flash("error" , "You don't have permission to change other profile data");
		res.redirect("/user/" + req.params.id + "/employer/profile");
	}
});

// Update username of Employer on profile page
router.post("/user/:id/employer/profile/name" , middleware.isLoggedin , async function(req , res){
	try{
		if(req.params.id.toString() ===  req.user._id.toString()){
			// Find user from DB
			let datafullname = req.body.fullname.trim();
			var ansarr = datafullname.split(" ");
			ansarr = ansarr.filter(data => data.length > 0);
			if(datafullname.length > 0){
				var user = await User.findById(req.params.id);
				if(user.local.firstname){
					if(ansarr.length == 1){
						user.local.firstname = ansarr[0];
					}

					if(ansarr.length >= 2){
						var firstname = ansarr[0];
						var lastname = "";
						for(var i = 1; i < ansarr.length; i++){
							if(i == ansarr.length - 2){
								firstname = firstname + ansarr[i];
								continue;
							}
							if(i == ansarr.length -1){
								lastname = ansarr[i];
								continue;
							}
							firstname = firstname + " " + ansarr[i];
						}

						user.local.firstname = firstname;
						user.local.lastname = lastname;
					}
				 }else if(user.googleauth.fullname){
					 user.googleauth.fullname = datafullname;
				 }else{
					  user.linkedinauth.fullname = datafullname;
				 }
				 user.save();
				 res.redirect("/user/" + req.user._id+ "/employer/profile");
			}else{
				req.flash("error" , "Please provide Name.");
				res.redirect("/user/" + req.user._id+ "/employer/profile");
			}
			// Save username change data
		}else{
			req.flash("error" , "You don't have permission do change profile data");
			 res.redirect("/user/" + req.user._id + "/employer/profile");
		}

	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
	  
});


module.exports = router;