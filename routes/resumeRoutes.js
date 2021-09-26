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
	try{
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
			
			 await user.save();
			 res.redirect("/user/" + req.user._id + "/profile");	
			
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


// Employer profile images upload ==================
// Profile image upload
router.post("/:id/employer/profile/img/update" , middleware.isLoggedin , upload.array('filedata') , async function(req,res){
	  try{
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

	  }catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/" + req.user._id + "/profile");
	  }
});



// RESUME PAGE === 
router.get("/:id/resume" , middleware.isLoggedin , async function(req , res){
	try{
		let user  = await User.findById(req.params.id);
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
		req.flash("error" , err.message);
		res.redirect("back");
	}
});



// Update Resume details (Prof details) ====
router.post("/:id/resume/profdata" , middleware.isLoggedin ,  async function(req,res){
	   try{
			// FIND DATA FOR DB IF FOUND UPDATE PROFESSIONAL DATA OTHERWISE CREATE 
			if(req.params.id.toString() ===  req.user._id.toString()){
				let professionaldata = await Profdata.find({"author.id" : req.user._id});
				if(professionaldata.length > 0){
					// FOUND DATA
					professionaldata[0].text = req.body.text;
					professionaldata[0].save();
					res.redirect("/user/" + req.user._id + "/resume");
				}else{
					// CREATE NEW PROFESSIONAL DATA
						let profdata = await Profdata.create({ text : req.body.text});
						profdata.author.id = req.user._id;
						await profdata.save();
						res.redirect("/user/"+ req.user._id  + "/resume");
				}
			}else{
				req.flash("error" , "You don't have permission to do that");
				res.redirect("/user/"+ req.params.id + "/resume")
			}
	   }catch(err){
		   console.log(err);
		   req.flash("error" , err.message);
		   res.redirect("/user/"+ req.params.id + "/resume");
	   }
});



// CREATE NEW WORKEXP 
router.post("/:id/resume/workexp" , middleware.isLoggedin , upload.array('filedata') ,async function(req,res){
	try{
		if(req.params.id.toString() ===  req.user._id.toString()){
			if(req.body.currentworking === "yes"){
				var workedfrom = req.body.workedfrom;
				var workedto  = req.body.workedfrom;
			}else{
				var workedfrom = req.body.workedfrom;
				var workedto  = req.body.workedto;
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
			let workexpe = await Workexp.create(workdata); 
			workexpe.author.id = req.user._id;
			await workexpe.save();
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ req.params.id + "/resume");
		}
	}catch(err){
		console.log(err);
		req.flash("error", err.message);
		res.redirect("/user/"+ req.params.id + "/resume");
	}
	
});


// EDUCATION CREATE
router.post("/:id/resume/education" ,  middleware.isLoggedin , upload.array('educationfiles') ,  async function(req,res){
	try{
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
			let education = await Education.create(edudata); 
			education.author.id = req.user._id;
			await education.save();
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ req.params.id + "/resume");
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/"+ req.params.id + "/resume");
	}
	
});


// Award CREATE
router.post("/:id/resume/award" , middleware.isLoggedin ,  async function(req,res){
	try{
		if(req.params.id.toString() ===  req.user._id.toString()){
			var awardobj = {
				title : req.body.title,
				date : req.body.date,
				text : req.body.text,
			}
			let award = await Award.create(awardobj);
			award.author.id = req.user._id;
			await award.save();
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ req.params.id + "/resume");
		}
	}catch(err){
		console.log(err);
		req.flash("error", err.message);
		res.redirect("/user/"+ req.params.id + "/resume");
	}
});



// PROJECT CREATE ROUTE  
router.post("/:id/resume/project" , middleware.isLoggedin ,  async function(req,res){
	try{
		if(req.params.id.toString() ===  req.user._id.toString()){
			if(req.body.datestart === req.body.datecompl){
				var projectstart = req.body.datestart;
				var projectend = projectstart;
			}else{
				var projectstart = req.body.datestart;
				var projectend =  req.body.datecompl;
			}

			var projectobj = {
				title : req.body.title,
				datefrom : projectstart,
				dateto :  projectend,
				text : req.body.text,
			}
			let project = await Project.create(projectobj);
			project.author.id = req.user._id;
			await project.save();
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ req.params.id + "/resume");
		}

	}catch(err){
		console.log(err);
		req.flash("error", err.message);
		res.redirect("/user/"+ req.params.id + "/resume");
	}
	
});



// OTHER NEW CREATE 
router.post("/:id/resume/other" , middleware.isLoggedin , async function(req,res){
	try{
		if(req.params.id.toString() ===  req.user._id.toString()){
			var otherdata = {
				title : req.body.title,
				description : req.body.description
			}
			let other = await Other.create(otherdata); 
			other.author.id = req.user._id;
			await other.save();
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ req.params.id + "/resume");
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("/user/"+ req.params.id + "/resume");
	}
});


// WORKEXP UPDATE ROUTE 
router.put("/workexp/:id" , middleware.isLoggedin , upload.array('educationfiles') , async function(req,res){
	try{
		let foundworkexp = await Workexp.findById(req.params.id);
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
					
			let updateddata = await Workexp.findByIdAndUpdate(req.params.id , workdata); 
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			  req.flash("error" , "You don't have permission to do that");
			  res.redirect("/user/"+ authorid  + "/resume");
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
	 
});




// WORK EXP ATTACHMENT DELETE ROUTE
router.get("/workexp/:id/:dataid" , middleware.isLoggedin , async function(req,res){
	try{
		let workexp =  await Workexp.findById(req.params.id);
		var authorid = workexp.author.id;
		for(var i = 0 ; i < workexp.fileurl.length ; i++){
			if( workexp.fileurl[i].dataid === req.params.dataid){
				workexp.fileurl.splice(i , 1);
				workexp.save();
				await cloudinary.v2.uploader.destroy(req.params.dataid);
			}
		}
		res.redirect("/user/" + authorid + "/resume");
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
});



// EDUCATION UPDATE ROUTE
router.put("/education/:id" , middleware.isLoggedin , upload.array('educationfiles') ,  async function(req,res){
	try{
		let edu = await Education.findById(req.params.id); 
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
				  
			let updateddata = await Education.findByIdAndUpdate(req.params.id , edudata);
			res.redirect("/user/" + req.user._id + "/resume");
			
		}else{
				req.flash("error" , "You don't have permission to do that");
				res.redirect("/user/"+ authorid  + "/resume");
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
	 
});



router.get("/education/:id/:dataid" ,middleware.isLoggedin ,  async function(req,res){
	try{
		let education = await Education.findById(req.params.id);
		var authorid = education.author.id;
		for(var i = 0 ; i < education.fileurl.length ; i++){
			if( education.fileurl[i].dataid === req.params.dataid){
				education.fileurl.splice(i , 1);
				education.save();
				console.log("delating elem");
				await cloudinary.v2.uploader.destroy(req.params.dataid);
			}
		}
		res.redirect("/user/" + authorid + "/resume");
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
});



// AWARD UPDATE ROUTE
router.put("/award/:id" , middleware.isLoggedin , async function(req,res){
	try{
		let award = await Award.findById(req.params.id);
		var authorid = award.author.id;
		if(authorid.toString() ===  req.user._id.toString()){ 
			var awardobj = {
				title : req.body.title,
				date : req.body.date,
				text : req.body.text,
			}
			let updateddata = await Award.findByIdAndUpdate(req.params.id , awardobj); 
			 res.redirect("/user/" + req.user._id + "/resume");
				
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ authorid  + "/resume");  
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
		
});


// PROJECT UPDATE ROUTE
router.put("/project/:id" , middleware.isLoggedin , async function(req , res){
	try{
		let project = await Project.findById(req.params.id);
		var authorid = project.author.id;
		if(authorid.toString() ===  req.user._id.toString()){
			if(req.body.datestart === req.body.datecompl){
				var projectstart = req.body.datestart;
				var projectend = projectstart;
			}else{
				var projectstart = req.body.datestart;
				var projectend =  req.body.datecompl;
			}

			var projectobj = {
				title : req.body.title,
				datefrom : projectstart,
				dateto :  projectend,
				text : req.body.text,
			}
			let updateddata = await Project.findByIdAndUpdate(req.params.id , projectobj); 
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ authorid  + "/resume");  
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
	}
	
});



// OTHERS UPDATE ROUTE
router.put("/other/:id" , middleware.isLoggedin , async function(req,res){
	try{
		let other = await Other.findById(req.params.id); 
		var authorid = other.author.id;
		if(authorid.toString() ===  req.user._id.toString()){
			var otherdata = {
				title : req.body.title,
				description : req.body.description
			}
			let updateddata = await Other.findByIdAndUpdate(req.params.id , otherdata);
			res.redirect("/user/" + req.user._id + "/resume");
		}else{
			req.flash("error" , "You don't have permission to do that");
			res.redirect("/user/"+ authorid  + "/resume");  
		}
	}catch(err){
		console.log(err);
		req.flash("error" , err.message);
		res.redirect("back");
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