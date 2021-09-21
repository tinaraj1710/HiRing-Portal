var  router            =    require("express").Router(),
	 multer            =    require("multer"),
	 Education         =    require("../models/resume/education.js"),
	 Workexp    	   =    require("../models/resume/workexp.js"),
	 Job               =    require("../models/job/job"),
	 Award             =    require("../models/resume/award.js"),
	 Other             =    require("../models/resume/other.js"),
     Project           =    require("../models/resume/project.js"),
	 Profdata          = 	require("../models/resume/professionaldata.js"),
	 User              =    require("../models/user.js"),
	 middleware        =    require("../middleware");



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

// Candidate profile images upload = ================
// Profile image upload
router.post("/:id/profile/img/update" , middleware.isLoggedin , upload.array('filedata') , async function(req,res){
	  if(req.params.id.toString() ===  req.user._id.toString()){
		  var user = await User.findById(req.params.id);
		  var result = await upload_get_url(req.files[0].path);
		  if(user.local.firstname){
			  user.local.avatar  =  result.secure_url;
		      user.local.avatarid  =  result.public_id;
		  }else if(user.googleauth.fullname){
			  user.googleauth.avatar  =  result.secure_url;
		      user.googleauth.avatarid  =  result.public_id;
		  }else{
			  user.linkedinauth.avatar  =  result.secure_url;
		      user.linkedinauth.avatarid  =  result.public_id;
		  }
		  
		   user.save();
		   res.redirect("/user/" + req.user._id + "/profile");	
		  
	  }else{
		req.flash("error" , "You don't have permission do change profile data");
		   res.redirect("/user/" + req.user._id + "/profile");
	  }
});


// Employer profile images upload ==================
// Profile image upload
router.post("/:id/employer/profile/img/update" , middleware.isLoggedin , upload.array('filedata') , async function(req,res){
	  if(req.params.id.toString() ===  req.user._id.toString()){
		  var user = await User.findById(req.params.id);
		  var result = await upload_get_url(req.files[0].path);
		  if(user.local.firstname){
			  user.local.avatar  =  result.secure_url;
		      user.local.avatarid  =  result.public_id;
		  }else if(user.googleauth.fullname){
			  user.googleauth.avatar  =  result.secure_url;
		      user.googleauth.avatarid  =  result.public_id;
		  }else{
			  user.linkedinauth.avatar  =  result.secure_url;
		      user.linkedinauth.avatarid  =  result.public_id;
		  }
		  
		   user.save();
		   res.redirect("/user/" + req.user._id + "/employer/profile");	
		  
	  }else{
		req.flash("error" , "You don't have permission do change profile data");
		   res.redirect("/user/" + req.user._id + "/employer/profile");
	  }
});



// RESUME PAGE
router.get("/:id/resume" , middleware.isLoggedin , function(req , res){
	User.findById(req.params.id , async function(err , user){
			try{
				var totaloffletterofcandidate = await Job.find({"to" : user._id});
				var totaldefaulted = 0;
				for(var job of totaloffletterofcandidate){
					if(job.status === "defaulted"){
						totaldefaulted = totaldefaulted  + 1;
					}
				}
				var profdata   = await  Profdata.find({"author.id" : req.params.id});
				var workexps   =  await Workexp.find({"author.id" : req.params.id});
				var educations = await Education.find({"author.id" : req.params.id});
				var projects   = await Project.find({"author.id" : req.params.id});
				var awards     = await Award.find({"author.id" : req.params.id});
				var othersdata   = await Other.find({"author.id" : req.params.id});
			   res.render("candidate/resume.ejs" , {profdata : profdata , workexps : workexps , educations : educations  , awards : awards , projects : projects  , othersdata  : othersdata , user : user , totaldefaulted : totaldefaulted});
		  }catch(err){
			console.log(err);
		}
	});
});

router.post("/:id/resume/profdata" , middleware.isLoggedin ,  function(req,res){
	    // FIND DATA FOR DB IF FOUND UPDATE PROFESSIONAL DATA OTHERWISE CREATE 
		if(req.params.id.toString() ===  req.user._id.toString()){
			Profdata.find({"author.id" : req.user._id} , function(err , professionaldata){
			if(err)
				return conole.log(err);


			if(professionaldata.length > 0){
				// FOUND DATA
				professionaldata[0].text = req.body.text;
				professionaldata[0].save();
				res.redirect("/user/" + req.user._id + "/resume");
			}else{
				// CREATE NEW PROFESSIONAL DATA
					Profdata.create({
					  text : req.body.text,
					  } , function(err , profdata){
						profdata.author.id = req.user._id;
						profdata.save();
						res.redirect("/user/"+ req.user._id  + "/resume");

				});
			}
		});
	}else{
		req.flash("error" , "You don't have permission to do that");
		res.redirect("/user/"+ req.params.id + "/resume")
	}
	
});

// CREATE NEW WORKEXP 
router.post("/:id/resume/workexp" , middleware.isLoggedin , upload.array('filedata') ,async function(req,res){
	if(req.params.id.toString() ===  req.user._id.toString()){
		if(req.body.currentworking === "yes"){
			var workedfrom = req.body.workedfrom;
			var workedto  = req.body.workedfrom;
		}else{
			var workedfrom = req.body.workedfrom;
			var workedto  = req.body.workedto;
		}
		try{
			var filesarray = [];
			for(var file of req.files){
				var result = await upload_get_url(file.path);
				var dataobj = {
					dataurl : result.secure_url,
					dataid : result.public_id
				}
				filesarray.push(dataobj);
			}
			var workdata = {
			role : req.body.role,
			companyname : req.body.companyname,
			workedfrom : workedfrom,
			Workedto : workedto,
			city : req.body.city,
			country : req.body.country,
			text : req.body.text,
			filetitle  : req.body.filetitle,
			fileurl : filesarray
			}
			Workexp.create(workdata , function(err , workexpe){
				if(err)
					return console.log(err);

				workexpe.author.id = req.user._id;
				workexpe.save();
				res.redirect("/user/" + req.user._id + "/resume");
			});
		}catch(err){
			console.log(err);
		}
	}else{
		req.flash("error" , "You don't have permission to do that");
		res.redirect("/user/"+ req.params.id + "/resume");
	}
});


// EDUCATION CREATE
router.post("/:id/resume/education" ,  middleware.isLoggedin , upload.array('educationfiles') ,  async function(req,res){
	if(req.params.id.toString() ===  req.user._id.toString()){
		
		var filesarray = [];
			for(var file of req.files){
				var result = await upload_get_url(file.path);
				var dataobj = {
					dataurl : result.secure_url,
					dataid : result.public_id
				}
				filesarray.push(dataobj);
			}
		
		var edudata = {
			degree : req.body.degree,
			collagename : req.body.collagename,
			studyfield : req.body.studyfield,
			studiedfrom : req.body.studiedfrom,
			studiedto : req.body.studiedto,
			grade : req.body.grade,
			city : req.body.city,
			country : req.body.country,
			text : req.body.text,
			filetitle  : req.body.filetitle,
			fileurl : filesarray
		}
		Education.create(edudata , function(err , education){
			if(err)
				return console.log(err);

			education.author.id = req.user._id;
			education.save();
			res.redirect("/user/" + req.user._id + "/resume");
		});
	}else{
		req.flash("error" , "You don't have permission to do that");
		res.redirect("/user/"+ req.params.id + "/resume");
	}
});


// Award CREATE
router.post("/:id/resume/award" , middleware.isLoggedin ,  function(req,res){
	if(req.params.id.toString() ===  req.user._id.toString()){
		
		var award = {
			title : req.body.title,
			date : req.body.date,
			text : req.body.text,
		}
		Award.create(award , function(err , award){
			if(err)
				return console.log(err);

			award.author.id = req.user._id;
			award.save();
			res.redirect("/user/" + req.user._id + "/resume");
		});
	}else{
		req.flash("error" , "You don't have permission to do that");
		res.redirect("/user/"+ req.params.id + "/resume");
	}
});

// PROJECT CREATE ROUTE
router.post("/:id/resume/project" , middleware.isLoggedin ,  function(req,res){
	if(req.params.id.toString() ===  req.user._id.toString()){
			if(req.body.datestart === req.body.datecompl){
				var projectstart = req.body.datestart;
				var projectend = projectstart;
			}else{
				var projectstart = req.body.datestart;
				var projectend =  req.body.datecompl;
			}

			var project = {
				title : req.body.title,
				datefrom : projectstart,
				dateto :  projectend,
				text : req.body.text,
			}
			Project.create(project , function(err , project){
				if(err)
					return console.log(err);

				project.author.id = req.user._id;
				project.save();
				res.redirect("/user/" + req.user._id + "/resume");
			});
	}else{
		req.flash("error" , "You don't have permission to do that");
		res.redirect("/user/"+ req.params.id + "/resume");
	}
});


// OTHER NEW CREATE
router.post("/:id/resume/other" , middleware.isLoggedin , function(req,res){
	if(req.params.id.toString() ===  req.user._id.toString()){
		var otherdata = {
			title : req.body.title,
			description : req.body.description
		}
		Other.create(otherdata , function(err , other){
			if(err)
				return console.log(err);

			other.author.id = req.user._id;
			other.save();
			res.redirect("/user/" + req.user._id + "/resume");
		});
	}else{
		req.flash("error" , "You don't have permission to do that");
		res.redirect("/user/"+ req.params.id + "/resume");
	}
	
});

// WORKEXP UPDATE ROUTE
router.put("/workexp/:id" , middleware.isLoggedin , upload.array('educationfiles') , function(req,res){
	 Workexp.findById(req.params.id , async  function(err , foundworkexp){
		  if(err)
			  return console.log(err);
		 
		 var authorid = foundworkexp.author.id;
		 if(authorid.toString() ===  req.user._id.toString()){
			  if(req.files.length > 0){
				  for(var i = 0 ; i < foundworkexp.fileurl.length ; i++){
					   var dataid = foundworkexp.fileurl[i].dataid; 
					   await cloudinary.v2.uploader.destroy(dataid);
				  }
				  
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
			 
			
			 if(req.body.currentworking === "yes"){
					var workedfrom = req.body.workedfrom;
					var workedto  = req.body.workedfrom;
				}else{
					var workedfrom = req.body.workedfrom;
					var workedto  = req.body.workedto;
				}
			 // IF USER SELECTED FILE FOR UPDATE 
                if(filesarray.length > 0){
					   var workdata = {
						role : req.body.role,
						companyname : req.body.companyname,
						workedfrom : workedfrom,
						Workedto : workedto,
						city : req.body.city,
						country : req.body.country,
						text : req.body.text,
						filetitle : req.body.filetitle,
						fileurl : filesarray,
					  }
			     }else{
					 // USERS DOES NOT SELECED FOR ANT FILE UPDATE
						var workdata = {
						role : req.body.role,
						companyname : req.body.companyname,
						workedfrom : workedfrom,
						Workedto : workedto,
						city : req.body.city,
						country : req.body.country,
						text : req.body.text,
						filetitle : req.body.filetitle,
					  }
				}
				
				Workexp.findByIdAndUpdate(req.params.id , workdata , function(err, updateddata){
					if(err)
						return console.log(err);

					res.redirect("/user/" + req.user._id + "/resume");
				});
		  }else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ authorid  + "/resume");
		}
	 });
});

// WORK EXP ATTACHMENT DELETE ROUTE
router.get("/workexp/:id/:dataid" , middleware.isLoggedin , function(req,res){
	Workexp.findById(req.params.id ,async function(err , workexp){
		   if(err)
			 return console.log(err);
		
		     var authorid = workexp.author.id;
		     try{
		          for(var i = 0 ; i < workexp.fileurl.length ; i++){
			        if( workexp.fileurl[i].dataid === req.params.dataid){
					     workexp.fileurl.splice(i , 1);
					     workexp.save();
					     await cloudinary.v2.uploader.destroy(req.params.dataid);
				       }
		             }
			  }catch(err){
				 console.log(err);
			  }

		res.redirect("/user/" + authorid + "/resume");
	});
});

// EDUCATION UPDATE ROUTE
router.put("/education/:id" , middleware.isLoggedin , upload.array('educationfiles') ,  function(req,res){
	 Education.findById(req.params.id , async function(err , edu){
		  if(err)
			  return console.log(err);
		 
		 var authorid = edu.author.id;
		  if(authorid.toString() ===  req.user._id.toString()){ 
			  if(req.files.length > 0){
				  for(var i = 0 ; i < edu.fileurl.length ; i++){
					   var dataid = edu.fileurl[i].dataid; 
					   await cloudinary.v2.uploader.destroy(dataid);
				  }
				    
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
			   // IF USER SELECTED FILE FOR UPDATE 
			  if(filesarray.length > 0){
				  var edudata = {
					degree : req.body.degree,
					collagename : req.body.collagename,
					studyfield : req.body.studyfield,
					studiedfrom : req.body.studiedfrom,
					studiedto : req.body.studiedto,
					grade : req.body.grade,
					city : req.body.city,
					country : req.body.country,
					text : req.body.text,
					filetitle : req.body.filetitle,
					fileurl : filesarray,
					}
			  }else{
				  // USERS DOES NOT SELECED FOR ANT FILE UPDATE
				  var edudata = {
					degree : req.body.degree,
					collagename : req.body.collagename,
					studyfield : req.body.studyfield,
					studiedfrom : req.body.studiedfrom,
					studiedto : req.body.studiedto,
					grade : req.body.grade,
					city : req.body.city,
					country : req.body.country,
					text : req.body.text,
					filetitle : req.body.filetitle,
					}
			  }
				
			Education.findByIdAndUpdate(req.params.id , edudata , function(err, updateddata){
				if(err)
					return console.log(err);
				
				res.redirect("/user/" + req.user._id + "/resume");
			});
		  }else{
			  req.flash("error" , "You don't have permission to do that");
			  res.redirect("/user/"+ authorid  + "/resume");
		  }
		 });
});

router.get("/education/:id/:dataid" ,middleware.isLoggedin ,  function(req,res){
	  Education.findById(req.params.id , async function(err , education){
		 if(err)
			 return console.log(err);
		  
		     var authorid = education.author.id;
		     try{
		          for(var i = 0 ; i < education.fileurl.length ; i++){
			        if( education.fileurl[i].dataid === req.params.dataid){
					     education.fileurl.splice(i , 1);
					     education.save();
						console.log("delating elem");
					     await cloudinary.v2.uploader.destroy(req.params.dataid);
				       }
		             }
			  }catch(err){
				 console.log(err);
			  }
        
		res.redirect("/user/" + authorid + "/resume");
		  
	  });
});

// AWARD UPDATE ROUTE
router.put("/award/:id" , middleware.isLoggedin ,  function(req,res){
	Award.findById(req.params.id , function(err , award){
		  if(err)
			  return console.log(err);
		 
		 var authorid = award.author.id;
		  if(authorid.toString() ===  req.user._id.toString()){ 
				var award = {
					title : req.body.title,
					date : req.body.date,
					text : req.body.text,
				}
				Award.findByIdAndUpdate(req.params.id , award , function(err, updateddata){
							if(err)
								return console.log(err);

							res.redirect("/user/" + req.user._id + "/resume");
				});
		  }else{
			  req.flash("error" , "You don't have permission to do that");
			  res.redirect("/user/"+ authorid  + "/resume");  
		  }
	});
});


// PROJECT UPDATE ROUTE
router.put("/project/:id" , middleware.isLoggedin , function(req , res){
	Project.findById(req.params.id , function(err , project){
		  if(err)
			  return console.log(err);
		 
		 var authorid = project.author.id;
		  if(authorid.toString() ===  req.user._id.toString()){
				if(req.body.datestart === req.body.datecompl){
					var projectstart = req.body.datestart;
					var projectend = projectstart;
				}else{
					var projectstart = req.body.datestart;
					var projectend =  req.body.datecompl;
				}

				var project = {
					title : req.body.title,
					datefrom : projectstart,
					dateto :  projectend,
					text : req.body.text,
				}
				Project.findByIdAndUpdate(req.params.id , project , function(err , updateddata){
					if(err)
						return console.log(err);

					res.redirect("/user/" + req.user._id + "/resume");
				});
		  }else{
			  req.flash("error" , "You don't have permission to do that");
			  res.redirect("/user/"+ authorid  + "/resume");  
		  }
	});
});

// OTHERS UPDATE ROUTE
router.put("/other/:id" , middleware.isLoggedin , function(req,res){
	Other.findById(req.params.id , function(err , other){
		  if(err)
			  return console.log(err);
		 
		 var authorid = other.author.id;
		  if(authorid.toString() ===  req.user._id.toString()){
				var otherdata = {
					title : req.body.title,
					description : req.body.description
				}
				Other.findByIdAndUpdate(req.params.id , otherdata , function(err , updateddata){
					if(err)
						return console.log(err);

					res.redirect("/user/" + req.user._id + "/resume");
				});
		  }else{
			  req.flash("error" , "You don't have permission to do that");
			  res.redirect("/user/"+ authorid  + "/resume");  
		  }
	});
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