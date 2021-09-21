var router = require("express").Router();
var passport = require("passport");

// LINKEDIN LOGIN FIRE URL 
router.get('/linkedin',  passport.authenticate('linkedin', { state: 'SOME STATE'  }),
  function(req, res){
  });


// LINKEDIN REDIRECT ROUTE  
router.get('/linkedin/redirect', passport.authenticate('linkedin', {
  failureRedirect: '/dashboard/auth/login'
}) , function(req , res){
	if(req.user.role){
		req.flash("success" , "Welcome " + req.user.linkedinauth.fullname);
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