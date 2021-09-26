var  router       =   require("express").Router();
var  middleware   =    require("../middleware");
var  passport     =   require("passport");

// GOOGLE LOGIN/SIGNUP
router.get("/google" , passport.authenticate("google" , {
	scope : ["profile" , "email"],
})  , function(req , res){
});

// GOOGLE REDIRECT URL AFTER LOGIN
router.get("/google/redirect" , passport.authenticate("google" ,  { 
	failureRedirect: '/dashboard/auth/login',
 }) ,  function(req,res){
	if(req.user.role){
		req.flash("success" , "Welcome " + req.user.googleauth.fullname);
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
	}else{
		req.flash("success" , "Please select appropriate role");
	    res.redirect("/user/" + req.user._id + "/selectrole");
	}
	
});


module.exports = router;